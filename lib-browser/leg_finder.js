import each from 'lodash/each';
import isEmpty from 'lodash/isEmpty';
import flatMap from 'lodash/flatMap';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import pick from 'lodash/pick';
import sortedIndexBy from 'lodash/sortedIndexBy';
import debugMod from 'debug';
const debug = debugMod('option_finder');
export function closestDeltas(strikes, deltas) {
  let sorted = orderBy(map(strikes, contractList => contractList[0]), x => Math.abs(x.delta), 'asc');

  if (!sorted.length) {
    return null;
  }

  let closest = map(deltas, targetDelta => {
    if (targetDelta > 1) {
      // Deal with 0-1 delta range.
      targetDelta /= 100;
    }

    let index = sortedIndexBy(sorted, {
      delta: targetDelta
    }, x => Math.abs(x.delta));
    let greaterDistance = index < sorted.length ? Math.abs(sorted[index].delta) - targetDelta : Infinity;
    let lesserDistance = index > 0 ? targetDelta - Math.abs(sorted[index - 1].delta) : Infinity;
    let best = greaterDistance < lesserDistance ? sorted[index] : sorted[index - 1];
    return {
      target: targetDelta,
      contract: best,
      contracts: [sorted[index - 1], sorted[index]].filter(Boolean)
    };
  });
  return closest;
}
export function closestAfterDte(dates, dteTarget) {
  let closestDte = map(dteTarget, target => {
    let dteNum = Number.parseInt(target, 10);
    let requireMonthly = target[target.length - 1] === 'M';
    return {
      target: dteNum,
      dte: null,
      expiration: null,
      difference: Infinity,
      strikes: null,
      requireMonthly
    };
  });
  debug(closestDte);
  each(dates, (strikeMap, key) => {
    let [expirationDate, dteStr] = key.split(':');
    let dte = +dteStr;
    let isMonthly = false;
    each(strikeMap, contract => {
      let desc = contract[0].description || '';
      isMonthly = !desc.endsWith('(Weekly)');
      return false;
    });
    each(closestDte, d => {
      if (d.requireMonthly && !isMonthly) {
        return;
      }

      let difference = dte - d.target; // If the current expiration >= the target number and is smaller than what we had before, then use it.

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
export function analyzeSide(config, allExpirations) {
  if (isEmpty(allExpirations)) {
    return [];
  }

  let expirations = closestAfterDte(allExpirations, config.dte);
  let result = map(expirations, expiration => {
    let deltas = closestDeltas(expiration.strikes, config.delta);
    return {
      deltas,
      ...expiration
    };
  });
  return result;
}
export function filterLiquidity(config, data) {
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
export function analyzeLiquidity(config, chain) {
  // debug("Analyzing", chain, typeof chain, "array", isArray(chain));
  let calls = analyzeSide(config, chain.callExpDateMap);
  let puts = analyzeSide(config, chain.putExpDateMap);
  let allData = calls.concat(puts);
  let results = flatMap(allData, expiration => {
    return expiration.deltas.map(delta => {
      let contract = delta.contract;
      return {
        expiration: expiration.expiration,
        targetDte: expiration.target,
        targetDelta: delta.target,
        spreadPercent: contract.bid ? (contract.ask / contract.bid - 1) * 100 : 1000,
        ...pick(contract, ['symbol', 'delta', 'putCall', 'strikePrice', 'daysToExpiration', 'bid', 'ask', 'totalVolume', 'openInterest'])
      };
    }).filter(data => filterLiquidity(config, data));
  });
  debug('Results', chain.symbol, results);
  return {
    symbol: chain.symbol,
    results
  };
}
//# sourceMappingURL=leg_finder.js.map