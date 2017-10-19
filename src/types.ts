import * as _ from 'lodash';

export interface OptionLeg {
  id? : string;
  symbol : string;
  strike : number;
  expiration: string;
  call : boolean;
  size : number;
  price? : number;
}

export function fullSymbol(ol: OptionLeg) {
  if(!_.isNil(ol.call) && ol.strike) {
    let legType = ol.call ? 'C' : 'P';
    let strike = _.padStart((ol.strike * 1000).toString(), 8, '0').slice(0, 8);
    let symbol = _.padEnd(ol.symbol, 6, ' ');
    return `${symbol}${ol.expiration}${legType}${strike}`;
  } else {
    // Otherwise it's just an equity.
    return ol.symbol;
  }
}