"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function occExpirationFromDate(d) {
    let year = d
        .getUTCFullYear()
        .toString()
        .slice(2);
    let month = _.padStart((d.getUTCMonth() + 1).toString(), 2, "0");
    let day = _.padStart(d.getUTCDate().toString(), 2, "0");
    return `${year}${month}${day}`;
}
exports.occExpirationFromDate = occExpirationFromDate;
function dateFromOccExpiration(e) {
    let year = "20" + e.slice(0, 2);
    return new Date(+year, +e.slice(2, 4) - 1, +e.slice(4));
}
exports.dateFromOccExpiration = dateFromOccExpiration;
function fullSymbol(ol, padSymbol = true) {
    if (!_.isNil(ol.call) && ol.strike) {
        let legType = ol.call ? "C" : "P";
        let strike = _.padStart((ol.strike * 1000).toString(), 8, "0").slice(0, 8);
        let symbol = padSymbol ? _.padEnd(ol.underlying, 6, " ") : ol.underlying;
        return `${symbol}${ol.expiration}${legType}${strike}`;
    }
    else {
        // Otherwise it's just an equity.
        return ol.underlying;
    }
}
exports.fullSymbol = fullSymbol;
function optionInfoFromSymbol(symbol) {
    let underlying = symbol.slice(0, 6).trim();
    if (symbol.length <= 6) {
        return {
            underlying,
            expiration: undefined,
            call: undefined,
            strike: undefined
        };
    }
    return {
        underlying,
        expiration: symbol.slice(6, 12),
        call: symbol[12] === "C",
        strike: +_.trimStart(symbol.slice(13)) / 1000
    };
}
exports.optionInfoFromSymbol = optionInfoFromSymbol;
function optionInfoFromLeg(leg) {
    return Object.assign({ id: leg.id, size: leg.size }, optionInfoFromSymbol(leg.symbol));
}
exports.optionInfoFromLeg = optionInfoFromLeg;
//# sourceMappingURL=types.js.map