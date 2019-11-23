"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.closestDeltas = closestDeltas;
exports.closestAfterDte = closestAfterDte;
exports.analyzeSide = analyzeSide;
exports.filterLiquidity = filterLiquidity;
exports.analyzeLiquidity = analyzeLiquidity;

var _ = _interopRequireWildcard(require("lodash"));

var debugMod = _interopRequireWildcard(require("debug"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const debug = debugMod('option_finder');

function closestDeltas(strikes, deltas) {
  let sorted = _.chain(strikes).map(contractList => contractList[0]).orderBy(x => Math.abs(x.delta), 'asc').value();

  if (!sorted.length) {
    return null;
  }

  let closest = _.map(deltas, targetDelta => {
    if (targetDelta > 1) {
      // Deal with 0-1 delta range.
      targetDelta /= 100;
    }

    let index = _.sortedIndexBy(sorted, {
      delta: targetDelta
    }, x => Math.abs(x.delta));

    let greaterDistance = index < sorted.length ? Math.abs(sorted[index].delta - targetDelta) : Infinity;
    let lesserDistance = index > 0 ? Math.abs(sorted[index - 1].delta - targetDelta) : Infinity;
    let best = greaterDistance < lesserDistance ? sorted[index] : sorted[index - 1];
    return {
      target: targetDelta,
      contract: best
    };
  });

  return closest;
}

function closestAfterDte(dates, dteTarget) {
  let closestDte = _.map(dteTarget, target => {
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

  _.each(dates, (strikeMap, key) => {
    let [expirationDate, dteStr] = key.split(':');
    let dte = +dteStr;
    let isMonthly = false;

    _.each(strikeMap, contract => {
      let desc = contract[0].description || '';
      isMonthly = !desc.endsWith('(Weekly)');
      return false;
    });

    _.each(closestDte, d => {
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

function analyzeSide(config, allExpirations) {
  if (_.isEmpty(allExpirations)) {
    return [];
  }

  let expirations = closestAfterDte(allExpirations, config.dte);

  let result = _.map(expirations, expiration => {
    let deltas = closestDeltas(expiration.strikes, config.delta);
    return {
      deltas,
      ...expiration
    };
  });

  return result;
}

function filterLiquidity(config, data) {
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

function analyzeLiquidity(config, chain) {
  // debug("Analyzing", chain, typeof chain, "array", _.isArray(chain));
  let calls = analyzeSide(config, chain.callExpDateMap);
  let puts = analyzeSide(config, chain.putExpDateMap);
  let allData = calls.concat(puts);

  let results = _.flatMap(allData, expiration => {
    return _.chain(expiration.deltas).map(delta => {
      let contract = delta.contract;
      return {
        expiration: expiration.expiration,
        targetDte: expiration.target,
        targetDelta: delta.target,
        spreadPercent: contract.bid ? (contract.ask / contract.bid - 1) * 100 : 1000,
        ..._.pick(contract, ['symbol', 'delta', 'putCall', 'strikePrice', 'daysToExpiration', 'bid', 'ask', 'totalVolume', 'openInterest'])
      };
    }).filter(data => filterLiquidity(config, data)).value();
  });

  debug('Results', chain.symbol, results);
  return {
    symbol: chain.symbol,
    results
  };
}
//# sourceMappingURL=leg_finder.js.map