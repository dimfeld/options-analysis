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
function occExpirationFromDate(d) {
    var year = d
        .getUTCFullYear()
        .toString()
        .slice(2);
    var month = _.padStart((d.getUTCMonth() + 1).toString(), 2, "0");
    var day = _.padStart(d.getUTCDate().toString(), 2, "0");
    return "" + year + month + day;
}
exports.occExpirationFromDate = occExpirationFromDate;
function dateFromOccExpiration(e) {
    var year = "20" + e.slice(0, 2);
    return new Date(+year, +e.slice(2, 4) - 1, +e.slice(4));
}
exports.dateFromOccExpiration = dateFromOccExpiration;
function fullSymbol(ol, padSymbol) {
    if (padSymbol === void 0) { padSymbol = true; }
    if (!_.isNil(ol.call) && ol.strike) {
        var legType = ol.call ? "C" : "P";
        var strike = _.padStart((ol.strike * 1000).toString(), 8, "0").slice(0, 8);
        var symbol = padSymbol ? _.padEnd(ol.underlying, 6, " ") : ol.underlying;
        return "" + symbol + ol.expiration + legType + strike;
    }
    else {
        // Otherwise it's just an equity.
        return ol.underlying;
    }
}
exports.fullSymbol = fullSymbol;
function optionInfoFromSymbol(symbol) {
    var underlying = symbol.slice(0, 6).trim();
    if (symbol.length <= 6) {
        return {
            underlying: underlying,
            expiration: undefined,
            call: undefined,
            strike: undefined
        };
    }
    return {
        underlying: underlying,
        expiration: symbol.slice(6, 12),
        call: symbol[12] === "C",
        strike: +_.trimStart(symbol.slice(13)) / 1000
    };
}
exports.optionInfoFromSymbol = optionInfoFromSymbol;
function optionInfoFromLeg(leg) {
    return __assign({ id: leg.id, size: leg.size }, optionInfoFromSymbol(leg.symbol));
}
exports.optionInfoFromLeg = optionInfoFromLeg;
//# sourceMappingURL=types.js.map