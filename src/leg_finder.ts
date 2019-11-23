import * as _ from 'lodash';
import * as debugMod from 'debug';
import { ContractInfo } from 'tda-api';

const debug = debugMod('option_finder');

export type StrikeMap = _.Dictionary<ContractInfo[]>;
export type ExpirationDateMap = _.Dictionary<StrikeMap>;

export function closestDeltas(strikes: StrikeMap, deltas: number[]) {
  let sorted = _.chain(strikes)
    .map((contractList) => contractList[0])
    .orderBy((x) => Math.abs(x.delta), 'asc')
    .value();
  if (!sorted.length) {
    return null;
  }

  let closest = _.map(deltas, (targetDelta) => {
    if (targetDelta > 1) {
      // Deal with 0-1 delta range.
      targetDelta /= 100;
    }
    let index = _.sortedIndexBy<Partial<ContractInfo>>(
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
  let closestDte = _.map(dteTarget, (target) => {
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

  _.each(dates, (strikeMap, key) => {
    let [expirationDate, dteStr] = key.split(':');
    let dte = +dteStr;
    let isMonthly = false;
    _.each(strikeMap, (contract) => {
      let desc = contract[0].description || '';
      isMonthly = !desc.endsWith('(Weekly)');
      return false;
    });

    _.each(closestDte, (d) => {
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
  if (_.isEmpty(allExpirations)) {
    return [];
  }

  let expirations = closestAfterDte(allExpirations, config.dte);
  let result = _.map(expirations, (expiration) => {
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
  let results = _.flatMap(allData, (expiration) => {
    return _.chain(expiration.deltas)
      .map((delta) => {
        let contract = delta.contract;
        return {
          expiration: expiration.expiration,
          targetDte: expiration.target,
          targetDelta: delta.target,
          spreadPercent: contract.bid
            ? (contract.ask / contract.bid - 1) * 100
            : 1000,
          ..._.pick(contract, [
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
      })
      .filter((data) => filterLiquidity(config, data))
      .value();
  });

  debug('Results', chain.symbol, results);

  return { symbol: chain.symbol, results };
}
