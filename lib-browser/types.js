import isNil from 'lodash/isNil';
import trimStart from 'lodash/trimStart';
import padStart from 'lodash/padStart';
import padEnd from 'lodash/padEnd';
export function occExpirationFromDate(d) {
  let year = d.getUTCFullYear().toString().slice(2);
  let month = padStart((d.getUTCMonth() + 1).toString(), 2, '0');
  let day = padStart(d.getUTCDate().toString(), 2, '0');
  return `${year}${month}${day}`;
}
export function dateFromOccExpiration(e) {
  let year = '20' + e.slice(0, 2);
  return new Date(+year, +e.slice(2, 4) - 1, +e.slice(4));
}
export function fullSymbol(ol, padSymbol = true) {
  if (!isNil(ol.call) && ol.strike) {
    let legType = ol.call ? 'C' : 'P';
    let strike = padStart((ol.strike * 1000).toString(), 8, '0').slice(0, 8);
    let symbol = padSymbol ? padEnd(ol.underlying, 6, ' ') : ol.underlying;
    return `${symbol}${ol.expiration}${legType}${strike}`;
  } else {
    // Otherwise it's just an equity.
    return ol.underlying;
  }
}
export function optionInfoFromSymbol(symbol) {
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
    strike: +trimStart(symbol.slice(13)) / 1000
  };
}
export function optionInfoFromLeg(leg) {
  return {
    id: leg.id,
    size: leg.size,
    ...optionInfoFromSymbol(leg.symbol)
  };
}
//# sourceMappingURL=types.js.map