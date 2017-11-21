import * as _ from 'lodash';

export interface OptionLeg {
  id? : string;
  symbol : string;
  strike : number;
  expiration: string;
  call : boolean;
  size? : number;
  price? : number;
}

export function occExpirationFromDate(d : Date) {
  let year = d.getUTCFullYear().toString().slice(2);
  let month = _.padStart((d.getUTCMonth() + 1).toString(), 2, '0');
  let day = _.padStart(d.getUTCDate().toString(), 2, '0');
  return `${year}${month}${day}`;
}

export function fullSymbol(ol: OptionLeg, padSymbol=true) {
  if(!_.isNil(ol.call) && ol.strike) {
    let legType = ol.call ? 'C' : 'P';
    let strike = _.padStart((ol.strike * 1000).toString(), 8, '0').slice(0, 8);
    let symbol = padSymbol ? _.padEnd(ol.symbol, 6, ' ') : ol.symbol;
    return `${symbol}${ol.expiration}${legType}${strike}`;
  } else {
    // Otherwise it's just an equity.
    return ol.symbol;
  }
}