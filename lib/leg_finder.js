"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.closestDeltas = closestDeltas;
exports.closestAfterDte = closestAfterDte;
exports.analyzeSide = analyzeSide;
exports.filterLiquidity = filterLiquidity;
exports.analyzeLiquidity = analyzeLiquidity;

var _each = _interopRequireDefault(require("lodash/each"));

var _map = _interopRequireDefault(require("lodash/map"));

var _pick = _interopRequireDefault(require("lodash/pick"));

var _flatMap = _interopRequireDefault(require("lodash/flatMap"));

var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));

var _orderBy = _interopRequireDefault(require("lodash/orderBy"));

var _sortedIndexBy = _interopRequireDefault(require("lodash/sortedIndexBy"));

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug.default)('option_finder');

function closestDeltas(strikes, deltas) {
  let sorted = (0, _orderBy.default)((0, _map.default)(strikes, contractList => contractList[0]), x => Math.abs(x.delta), 'asc');

  if (!sorted.length) {
    return null;
  }

  let closest = (0, _map.default)(deltas, targetDelta => {
    if (targetDelta > 1) {
      // Deal with 0-1 delta range.
      targetDelta /= 100;
    }

    let index = (0, _sortedIndexBy.default)(sorted, {
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
  let closestDte = (0, _map.default)(dteTarget, target => {
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
  (0, _each.default)(dates, (strikeMap, key) => {
    let [expirationDate, dteStr] = key.split(':');
    let dte = +dteStr;
    let isMonthly = false;
    (0, _each.default)(strikeMap, contract => {
      let desc = contract[0].description || '';
      isMonthly = !desc.endsWith('(Weekly)');
      return false;
    });
    (0, _each.default)(closestDte, d => {
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
  if ((0, _isEmpty.default)(allExpirations)) {
    return [];
  }

  let expirations = closestAfterDte(allExpirations, config.dte);
  let result = (0, _map.default)(expirations, expiration => {
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
  let results = (0, _flatMap.default)(allData, expiration => {
    return (0, _map.default)(expiration.deltas, delta => {
      let contract = delta.contract;
      return {
        expiration: expiration.expiration,
        targetDte: expiration.target,
        targetDelta: delta.target,
        spreadPercent: contract.bid ? (contract.ask / contract.bid - 1) * 100 : 1000,
        ...(0, _pick.default)(contract, ['symbol', 'delta', 'putCall', 'strikePrice', 'daysToExpiration', 'bid', 'ask', 'totalVolume', 'openInterest'])
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