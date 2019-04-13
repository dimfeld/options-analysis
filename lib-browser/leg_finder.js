"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var debugMod = require("debug");
var debug = debugMod('option_finder');
function closestDeltas(strikes, deltas) {
    var sorted = _.chain(strikes)
        .map(function (contractList) { return contractList[0]; })
        .orderBy(function (x) { return Math.abs(x.delta); }, 'asc')
        .value();
    if (!sorted.length) {
        return null;
    }
    var closest = _.map(deltas, function (targetDelta) {
        if (targetDelta > 1) {
            // Deal with 0-1 delta range.
            targetDelta /= 100;
        }
        var index = _.sortedIndexBy(sorted, { delta: targetDelta }, function (x) { return Math.abs(x.delta); });
        var greaterDistance = index < sorted.length ? Math.abs(sorted[index].delta - targetDelta) : Infinity;
        var lesserDistance = index > 0 ? Math.abs(sorted[index - 1].delta - targetDelta) : Infinity;
        var best = greaterDistance < lesserDistance ? sorted[index] : sorted[index - 1];
        return { target: targetDelta, contract: best };
    });
    return closest;
}
exports.closestDeltas = closestDeltas;
function closestAfterDte(dates, dteTarget) {
    var closestDte = _.map(dteTarget, function (target) {
        var dteNum = Number.parseInt(target, 10);
        var requireMonthly = target[target.length - 1] === 'M';
        return { target: dteNum, dte: null, expiration: null, difference: Infinity, strikes: null, requireMonthly: requireMonthly };
    });
    debug(closestDte);
    _.each(dates, function (strikeMap, key) {
        var _a = key.split(':'), expirationDate = _a[0], dteStr = _a[1];
        var dte = +dteStr;
        var isMonthly = false;
        _.each(strikeMap, function (contract) {
            var desc = contract[0].description || '';
            isMonthly = !desc.endsWith('(Weekly)');
            return false;
        });
        _.each(closestDte, function (d) {
            if (d.requireMonthly && !isMonthly) {
                return;
            }
            var difference = dte - d.target;
            // If the current expiration >= the target number and is smaller than what we had before, then use it.
            if (difference >= 0 && (difference < d.difference)) {
                d.strikes = strikeMap;
                d.difference = difference;
                d.dte = dte;
                d.expiration = expirationDate;
            }
        });
    });
    return closestDte;
}
exports.closestAfterDte = closestAfterDte;
function analyzeSide(config, allExpirations) {
    if (_.isEmpty(allExpirations)) {
        return [];
    }
    var expirations = closestAfterDte(allExpirations, config.dte);
    var result = _.map(expirations, function (expiration) {
        var deltas = closestDeltas(expiration.strikes, config.delta);
        return __assign({ deltas: deltas }, expiration);
    });
    return result;
}
exports.analyzeSide = analyzeSide;
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
exports.filterLiquidity = filterLiquidity;
function analyzeLiquidity(config, chain) {
    // debug("Analyzing", chain, typeof chain, "array", _.isArray(chain));
    var calls = analyzeSide(config, chain.callExpDateMap);
    var puts = analyzeSide(config, chain.putExpDateMap);
    var allData = calls.concat(puts);
    var results = _.flatMap(allData, function (expiration) {
        return _.chain(expiration.deltas)
            .map(function (delta) {
            var contract = delta.contract;
            return __assign({ expiration: expiration.expiration, targetDte: expiration.target, targetDelta: delta.target, spreadPercent: contract.bid ? ((contract.ask / contract.bid) - 1) * 100 : 1000 }, _.pick(contract, ['symbol', 'delta', 'putCall', 'strikePrice', 'daysToExpiration', 'bid', 'ask', 'totalVolume', 'openInterest']));
        })
            .filter(function (data) { return filterLiquidity(config, data); })
            .value();
    });
    debug("Results", chain.symbol, results);
    return { symbol: chain.symbol, results: results };
}
exports.analyzeLiquidity = analyzeLiquidity;
//# sourceMappingURL=leg_finder.js.map