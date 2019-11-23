"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.occExpirationFromDate = occExpirationFromDate;
exports.dateFromOccExpiration = dateFromOccExpiration;
exports.fullSymbol = fullSymbol;
exports.optionInfoFromSymbol = optionInfoFromSymbol;
exports.optionInfoFromLeg = optionInfoFromLeg;

var _ = _interopRequireWildcard(require("lodash"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function occExpirationFromDate(d) {
  let year = d.getUTCFullYear().toString().slice(2);

  let month = _.padStart((d.getUTCMonth() + 1).toString(), 2, '0');

  let day = _.padStart(d.getUTCDate().toString(), 2, '0');

  return `${year}${month}${day}`;
}

function dateFromOccExpiration(e) {
  let year = '20' + e.slice(0, 2);
  return new Date(+year, +e.slice(2, 4) - 1, +e.slice(4));
}

function fullSymbol(ol, padSymbol = true) {
  if (!_.isNil(ol.call) && ol.strike) {
    let legType = ol.call ? 'C' : 'P';

    let strike = _.padStart((ol.strike * 1000).toString(), 8, '0').slice(0, 8);

    let symbol = padSymbol ? _.padEnd(ol.underlying, 6, ' ') : ol.underlying;
    return `${symbol}${ol.expiration}${legType}${strike}`;
  } else {
    // Otherwise it's just an equity.
    return ol.underlying;
  }
}

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
    call: symbol[12] === 'C',
    strike: +_.trimStart(symbol.slice(13)) / 1000
  };
}

function optionInfoFromLeg(leg) {
  return {
    id: leg.id,
    size: leg.size,
    ...optionInfoFromSymbol(leg.symbol)
  };
}
//# sourceMappingURL=types.js.map