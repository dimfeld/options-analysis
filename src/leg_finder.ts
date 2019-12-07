import each from 'lodash/each';
import map from 'lodash/map';
import pick from 'lodash/pick';
import flatMap from 'lodash/flatMap';
import isEmpty from 'lodash/isEmpty';
import orderBy from 'lodash/orderBy';
import sortedIndexBy from 'lodash/sortedIndexBy';
import { Dictionary } from 'lodash';
import debugMod from 'debug';
import { ContractInfo } from 'tda-api';

const debug = debugMod('option_finder');

export type StrikeMap = Dictionary<ContractInfo[]>;
export type ExpirationDateMap = Dictionary<StrikeMap>;

export function closestDeltas(strikes: StrikeMap, deltas: number[]) {
  let sorted = orderBy(
    map(strikes, (contractList) => contractList[0]),
    (x) => Math.abs(x.delta),
    'asc'
  );

  if (!sorted.length) {
    return null;
  }

  let closest = map(deltas, (targetDelta) => {
    if (targetDelta > 1) {
      // Deal with 0-1 delta range.
      targetDelta /= 100;
    }
    let index = sortedIndexBy<Partial<ContractInfo>>(
      sorted,
      { delta: targetDelta },
      (x) => Math.abs(x.delta)
    );
    let greaterDistance =
      index < sorted.length
        ? Math.abs(sorted[index].delta - targetDelta)
        : Infinity;
    let lesserDistance =
      index > 0 ? Math.abs(sorted[index - 1].delta - targetDelta) : Infinity;
    let best =
      greaterDistance < lesserDistance ? sorted[index] : sorted[index - 1];
    return { target: targetDelta, contract: best };
  });

  return closest;
}

interface ClosestDte {
  target: number;
  dte: number;
  expiration: string;
  difference: number;
  strikes: StrikeMap;
}

export function closestAfterDte(
  dates: ExpirationDateMap,
  dteTarget: string[]
): ClosestDte[] {
  let closestDte = map(dteTarget, (target) => {
    let dteNum = Number.parseInt(target, 10);
    let requireMonthly = target[target.length - 1] === 'M';
    return {
      target: dteNum,
      dte: null,
      expiration: null,
      difference: Infinity,
      strikes: null,
      requireMonthly,
    };
  });

  debug(closestDte);

  each(dates, (strikeMap, key) => {
    let [expirationDate, dteStr] = key.split(':');
    let dte = +dteStr;
    let isMonthly = false;
    each(strikeMap, (contract) => {
      let desc = contract[0].description || '';
      isMonthly = !desc.endsWith('(Weekly)');
      return false;
    });

    each(closestDte, (d) => {
      if (d.requireMonthly && !isMonthly) {
        return;
      }

      let difference = dte - d.target;

      // If the current expiration >= the target number and is smaller than what we had before, then use it.
      if (difference >= 0 && difference < d.difference) {
        d.strikes = strikeMap;
        d.difference = difference;
        d.dte = dte;
        d.expiration = expirationDate;
      }
    });
  });

  return closestDte;
}

export interface AnalyzeSideOptions {
  dte: string[];
  delta: number[];
}

export function analyzeSide(
  config: AnalyzeSideOptions,
  allExpirations: ExpirationDateMap
) {
  if (isEmpty(allExpirations)) {
    return [];
  }

  let expirations = closestAfterDte(allExpirations, config.dte);
  let result = map(expirations, (expiration) => {
    let deltas = closestDeltas(expiration.strikes, config.delta);
    return {
      deltas,
      ...expiration,
    };
  });

  return result;
}

export interface FilterLiquidityArguments {
  maxSpreadPercent?: number;
  minVolume?: number;
  minOpenInterest?: number;
}

export interface LiquidityInfo {
  spreadPercent?: number;
  totalVolume?: number;
  openInterest?: number;
}

export function filterLiquidity(
  config: FilterLiquidityArguments,
  data: LiquidityInfo
) {
  if (data.spreadPercent > (config.maxSpreadPercent || Infinity)) {
    return false;
  }

  if (data.totalVolume < (config.minVolume || 0)) {
    return false;
  }

  if (data.openInterest < (config.minOpenInterest || 0)) {
    return false;
  }

  return true;
}

export interface AnalyzeLiquidityOptions {
  symbol: string;
  callExpDateMap: ExpirationDateMap;
  putExpDateMap: ExpirationDateMap;
}

export function analyzeLiquidity(
  config: AnalyzeSideOptions & FilterLiquidityArguments,
  chain: AnalyzeLiquidityOptions
) {
  // debug("Analyzing", chain, typeof chain, "array", _.isArray(chain));
  let calls = analyzeSide(config, chain.callExpDateMap);
  let puts = analyzeSide(config, chain.putExpDateMap);

  let allData = calls.concat(puts);
  let results = flatMap(allData, (expiration) => {
    return map(expiration.deltas, (delta) => {
      let contract = delta.contract;
      return {
        expiration: expiration.expiration,
        targetDte: expiration.target,
        targetDelta: delta.target,
        spreadPercent: contract.bid
          ? (contract.ask / contract.bid - 1) * 100
          : 1000,
        ...pick(contract, [
          'symbol',
          'delta',
          'putCall',
          'strikePrice',
          'daysToExpiration',
          'bid',
          'ask',
          'totalVolume',
          'openInterest',
        ]),
      };
    }).filter((data) => filterLiquidity(config, data));
  });

  debug('Results', chain.symbol, results);

  return { symbol: chain.symbol, results };
}
