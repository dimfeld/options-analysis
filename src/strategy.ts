import { OptionLeg } from './types';
import * as _ from 'lodash';

export type Classifier = (legs : OptionLeg[], score : ComboScore) => string|null;

export function isShort(leg : OptionLeg) { return leg.size < 0; }
export function isLong(leg : OptionLeg) { return leg.size > 1; }
export function isShortPut(leg : OptionLeg) { return !leg.call && isShort(leg); }
export function isLongPut(leg : OptionLeg) { return !leg.call && isLong(leg); }
export function isShortCall(leg : OptionLeg) { return leg.call && isShort(leg); }
export function isLongCall(leg: OptionLeg) { return leg.call && isLong(leg); }

export enum LegType {
  ShortPut = 0,
  LongPut = 1,
  ShortCall = 2,
  LongCall = 3,
}

export function legType(leg : OptionLeg) : LegType {
  if(isShort(leg)) {
    return leg.call ? LegType.ShortCall : LegType.ShortPut;
  } else {
    return leg.call ? LegType.LongCall : LegType.LongPut;
  }
}

export type ComboScore = number;
export const UnknownCombo : ComboScore = 1;

export function calculateComboScore(orderedLegs : OptionLeg[]) : ComboScore {
  if(orderedLegs.length > 8) {
    return UnknownCombo;
  }

  let x : ComboScore = 0;
  for(let i = 0; i < orderedLegs.length; i++) {
    let type = legType(orderedLegs[i]);
    x |= type << (i * 2);
  }
  return x;
}

export function comboScoreFromTypes(types : LegType[]) : ComboScore {
  let x : ComboScore = 0;
  for(let i = 0; i < types.length; i++) {
    x |= types[i] << (i * 2);
  }
  return x;
}

export const comboScores = {
  // Also iron butterfly
  shortIronCondor: comboScoreFromTypes([LegType.LongPut, LegType.ShortPut, LegType.ShortCall, LegType.LongCall]),
  shortInvertedIronCondor: comboScoreFromTypes([LegType.LongPut, LegType.ShortCall, LegType.ShortPut, LegType.LongCall]),
  // TODO maybe other inverted IC combinations?

  shortStrangle: comboScoreFromTypes([LegType.ShortPut, LegType.ShortCall]), // and straddle
  invertedShortStrangle: comboScoreFromTypes([LegType.ShortCall, LegType.ShortPut]),
  longStrangle: comboScoreFromTypes([LegType.LongPut, LegType.LongCall]), // and straddle
  invertedLongStrangle: comboScoreFromTypes([LegType.LongCall, LegType.LongPut]),
  putCreditSpread: comboScoreFromTypes([LegType.LongPut, LegType.ShortPut]),
  callCreditSpread: comboScoreFromTypes([LegType.ShortCall, LegType.LongCall]),
  putDebitSpread: comboScoreFromTypes([LegType.ShortPut, LegType.LongPut]),
  callDebitSpread: comboScoreFromTypes([LegType.LongCall, LegType.ShortCall]),
  shortSinglePut: comboScoreFromTypes([LegType.ShortPut]),
  shortSingleCall: comboScoreFromTypes([LegType.ShortCall]),
  longSinglePut: comboScoreFromTypes([LegType.LongPut]),
  longSingleCall: comboScoreFromTypes([LegType.LongCall]),

  // TODO Diagonal, double diagonal, calendars, ratios
};

export function formatExpiration(expiration : string) {
  // In the future this will format with a nice month/year/day.
  return expiration;
}

export const sameExpDescribers = {
  [comboScores.shortIronCondor]: (exp : string, legs: OptionLeg[]) => {
    let name = legs[1].strike === legs[2].strike ? 'Iron Butterfly' : 'Iron Condor';
    return `${-legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}P ${legs[2].strike}/${legs[3].strike}C ${name}`;
  },
  [comboScores.shortInvertedIronCondor]: (exp : string, legs: OptionLeg[]) => {
    return `${-legs[0].size} ${exp} Inverted Iron Condor ${legs[0].strike}/${legs[1].strike}P ${legs[2].strike}/${legs[3].strike}C`;
  },
  [comboScores.shortStrangle]: (exp : string, legs : OptionLeg[]) => {
    if(legs[0].strike === legs[1].strike) {
      return `${-legs[0].size} ${exp} ${legs[0].strike} Short Straddle`;
    } else {
      return `${-legs[0].size} ${exp} ${legs[0].strike}P ${legs[1].strike}C Short Strangle`
    }
  },
  [comboScores.invertedShortStrangle]: (exp: string, legs: OptionLeg[]) => {
    return `${-legs[0].size} ${exp} ${legs[0].strike}C ${legs[1].strike}P Inverted Short Strangle`;
  },
  [comboScores.longStrangle]: (exp: string, legs: OptionLeg[]) => {
    if(legs[0].strike === legs[1].strike) {
      return `${legs[0].size} ${exp} ${legs[0].strike} Long Straddle`;
    } else {
      return `${legs[0].size} ${exp} ${legs[0].strike}P ${legs[1].strike}C Long Strangle`
    }
  },
  [comboScores.invertedLongStrangle]: (exp: string, legs: OptionLeg[]) => {
    if(legs[0].strike === legs[1].strike) {
      return `${legs[0].size} ${exp} ${legs[0].strike} Inverted Long Straddle`;
    } else {
      return `${legs[0].size} ${exp} ${legs[0].strike}C ${legs[1].strike}P Interted Long Strangle`
    }
  },

  [comboScores.putCreditSpread]: (exp: string, legs: OptionLeg[]) => {
    return `${-legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}P Put Credit Spread`;
  },
  [comboScores.callCreditSpread]: (exp: string, legs: OptionLeg[]) => {
    return `${-legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}C Call Credit Spread`;
  },
  [comboScores.putDebitSpread]: (exp: string, legs: OptionLeg[]) => {
    return `${legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}P Put Debit Spread`;
  },
  [comboScores.callDebitSpread]: (exp: string, legs: OptionLeg[]) => {
    return `${legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}C Call Debit Spread`;
  },

  [comboScores.shortSinglePut]: (exp: string, legs: OptionLeg[]) => {
    return `${-legs[0].size} ${exp} ${legs[0].strike} Short Put`;
  },
  [comboScores.shortSingleCall]: (exp: string, legs: OptionLeg[]) => {
    return `${-legs[0].size} ${exp} ${legs[0].strike} Short Call`;
  },
  [comboScores.longSinglePut]: (exp: string, legs: OptionLeg[]) => {
    return `${legs[0].size} ${exp} ${legs[0].strike} Long Put`;
  },
  [comboScores.longSingleCall]: (exp: string, legs: OptionLeg[]) => {
    return `${legs[0].size} ${exp} ${legs[0].strike} Long Call`;
  },
};

export function classify(legs : OptionLeg[]) {
  let orderedLegs = _.sortBy(legs, ['strike', 'call', 'expiration']);
  let score = calculateComboScore(orderedLegs);
  let expiration = legs[0].expiration;
  let size = legs[0].size;

  let allSameExpiration = _.every(legs.slice(1), (leg) => leg.expiration === expiration);
  let allSameSize = _.every(legs.slice(1), (leg) => leg.size === size);
  if(!allSameExpiration || !allSameSize) {
    // Different expirations or sizes. Look for calendars, ratios, etc.
    return null;
  }

  let exp = formatExpiration(legs[0].expiration);
  let describer = sameExpDescribers[score];
  if(!describer) {
    return null;
  }

  return describer(exp, legs);
}
