"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.occExpirationFromDate = occExpirationFromDate;
exports.dateFromOccExpiration = dateFromOccExpiration;
exports.fullSymbol = fullSymbol;
exports.optionInfoFromSymbol = optionInfoFromSymbol;
exports.optionInfoFromLeg = optionInfoFromLeg;

var _isNil = _interopRequireDefault(require("lodash/isNil"));

var _trimStart = _interopRequireDefault(require("lodash/trimStart"));

var _padStart = _interopRequireDefault(require("lodash/padStart"));

var _padEnd = _interopRequireDefault(require("lodash/padEnd"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function occExpirationFromDate(d) {
  let year = d.getUTCFullYear().toString().slice(2);
  let month = (0, _padStart.default)((d.getUTCMonth() + 1).toString(), 2, '0');
  let day = (0, _padStart.default)(d.getUTCDate().toString(), 2, '0');
  return `${year}${month}${day}`;
}

function dateFromOccExpiration(e) {
  let year = '20' + e.slice(0, 2);
  return new Date(+year, +e.slice(2, 4) - 1, +e.slice(4));
}

function fullSymbol(ol, padSymbol = true) {
  if (!(0, _isNil.default)(ol.call) && ol.strike) {
    let legType = ol.call ? 'C' : 'P';
    let strike = (0, _padStart.default)((ol.strike * 1000).toString(), 8, '0').slice(0, 8);
    let symbol = padSymbol ? (0, _padEnd.default)(ol.underlying, 6, ' ') : ol.underlying;
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
    strike: +(0, _trimStart.default)(symbol.slice(13)) / 1000
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