"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isShort = isShort;
exports.isLong = isLong;
exports.isShortPut = isShortPut;
exports.isLongPut = isLongPut;
exports.isShortCall = isShortCall;
exports.isLongCall = isLongCall;
exports.legType = legType;
exports.calculateComboScore = calculateComboScore;
exports.comboScoreFromTypes = comboScoreFromTypes;
exports.formatExpiration = formatExpiration;
exports.classify = classify;
exports.sameExpDescribers = exports.comboScores = exports.UnknownCombo = exports.LegType = void 0;

var _types = require("./types");

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isShort(leg) {
  return leg.size < 0;
}

function isLong(leg) {
  return leg.size > 0;
}

function isShortPut(leg) {
  return !leg.call && isShort(leg);
}

function isLongPut(leg) {
  return !leg.call && isLong(leg);
}

function isShortCall(leg) {
  return leg.call && isShort(leg);
}

function isLongCall(leg) {
  return leg.call && isLong(leg);
}

let LegType;
exports.LegType = LegType;

(function (LegType) {
  LegType[LegType["ShortPut"] = 0] = "ShortPut";
  LegType[LegType["LongPut"] = 1] = "LongPut";
  LegType[LegType["ShortCall"] = 2] = "ShortCall";
  LegType[LegType["LongCall"] = 3] = "LongCall";
})(LegType || (exports.LegType = LegType = {}));

function legType(leg) {
  if (isShort(leg)) {
    return leg.call ? LegType.ShortCall : LegType.ShortPut;
  } else {
    return leg.call ? LegType.LongCall : LegType.LongPut;
  }
}

const UnknownCombo = 1;
exports.UnknownCombo = UnknownCombo;

function calculateComboScore(orderedLegs) {
  if (orderedLegs.length > 8) {
    return UnknownCombo;
  }

  let x = 0;

  for (let i = 0; i < orderedLegs.length; i++) {
    let type = legType(orderedLegs[i]);
    x |= type << i * 2;
  }

  return x;
}

function comboScoreFromTypes(types) {
  let x = 0;

  for (let i = 0; i < types.length; i++) {
    x |= types[i] << i * 2;
  }

  return x;
}

const comboScores = {
  // Also iron butterfly
  shortIronCondor: comboScoreFromTypes([LegType.LongPut, LegType.ShortPut, LegType.ShortCall, LegType.LongCall]),
  shortInvertedIronCondor: comboScoreFromTypes([LegType.LongPut, LegType.ShortCall, LegType.ShortPut, LegType.LongCall]),
  // TODO maybe other inverted IC combinations?
  shortStrangle: comboScoreFromTypes([LegType.ShortPut, LegType.ShortCall]),
  // and straddle
  invertedShortStrangle: comboScoreFromTypes([LegType.ShortCall, LegType.ShortPut]),
  longStrangle: comboScoreFromTypes([LegType.LongPut, LegType.LongCall]),
  // and straddle
  invertedLongStrangle: comboScoreFromTypes([LegType.LongCall, LegType.LongPut]),
  putCreditSpread: comboScoreFromTypes([LegType.LongPut, LegType.ShortPut]),
  callCreditSpread: comboScoreFromTypes([LegType.ShortCall, LegType.LongCall]),
  putDebitSpread: comboScoreFromTypes([LegType.ShortPut, LegType.LongPut]),
  callDebitSpread: comboScoreFromTypes([LegType.LongCall, LegType.ShortCall]),
  shortSinglePut: comboScoreFromTypes([LegType.ShortPut]),
  shortSingleCall: comboScoreFromTypes([LegType.ShortCall]),
  longSinglePut: comboScoreFromTypes([LegType.LongPut]),
  longSingleCall: comboScoreFromTypes([LegType.LongCall]) // TODO Diagonal, double diagonal, calendars, ratios

};
exports.comboScores = comboScores;

function formatExpiration(expiration) {
  // In the future this will format with a nice month/year/day.
  return expiration;
}

const sameExpDescribers = {
  [comboScores.shortIronCondor]: (exp, legs) => {
    let name = legs[1].strike === legs[2].strike ? 'Iron Butterfly' : 'Iron Condor';
    return `${-legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}P ${legs[2].strike}/${legs[3].strike}C ${name}`;
  },
  [comboScores.shortInvertedIronCondor]: (exp, legs) => {
    return `${-legs[0].size} ${exp} Inverted Iron Condor ${legs[0].strike}/${legs[1].strike}P ${legs[2].strike}/${legs[3].strike}C`;
  },
  [comboScores.shortStrangle]: (exp, legs) => {
    if (legs[0].strike === legs[1].strike) {
      return `${-legs[0].size} ${exp} ${legs[0].strike} Short Straddle`;
    } else {
      return `${-legs[0].size} ${exp} ${legs[0].strike}P ${legs[1].strike}C Short Strangle`;
    }
  },
  [comboScores.invertedShortStrangle]: (exp, legs) => {
    return `${-legs[0].size} ${exp} ${legs[0].strike}C ${legs[1].strike}P Inverted Short Strangle`;
  },
  [comboScores.longStrangle]: (exp, legs) => {
    if (legs[0].strike === legs[1].strike) {
      return `${legs[0].size} ${exp} ${legs[0].strike} Long Straddle`;
    } else {
      return `${legs[0].size} ${exp} ${legs[0].strike}P ${legs[1].strike}C Long Strangle`;
    }
  },
  [comboScores.invertedLongStrangle]: (exp, legs) => {
    if (legs[0].strike === legs[1].strike) {
      return `${legs[0].size} ${exp} ${legs[0].strike} Inverted Long Straddle`;
    } else {
      return `${legs[0].size} ${exp} ${legs[0].strike}C ${legs[1].strike}P Interted Long Strangle`;
    }
  },
  [comboScores.putCreditSpread]: (exp, legs) => {
    return `${-legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}P Put Credit Spread`;
  },
  [comboScores.callCreditSpread]: (exp, legs) => {
    return `${-legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}C Call Credit Spread`;
  },
  [comboScores.putDebitSpread]: (exp, legs) => {
    return `${legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}P Put Debit Spread`;
  },
  [comboScores.callDebitSpread]: (exp, legs) => {
    return `${legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}C Call Debit Spread`;
  },
  [comboScores.shortSinglePut]: (exp, legs) => {
    return `${-legs[0].size} ${exp} ${legs[0].strike} Short Put`;
  },
  [comboScores.shortSingleCall]: (exp, legs) => {
    return `${-legs[0].size} ${exp} ${legs[0].strike} Short Call`;
  },
  [comboScores.longSinglePut]: (exp, legs) => {
    return `${legs[0].size} ${exp} ${legs[0].strike} Long Put`;
  },
  [comboScores.longSingleCall]: (exp, legs) => {
    return `${legs[0].size} ${exp} ${legs[0].strike} Long Call`;
  }
};
exports.sameExpDescribers = sameExpDescribers;

function classify(legs) {
  let optionInfos = _lodash.default.map(legs, _types.optionInfoFromLeg);

  let orderedLegs = _lodash.default.sortBy(optionInfos, ['strike', 'call', 'expiration']);

  let score = calculateComboScore(orderedLegs);
  let expiration = optionInfos[0].expiration;
  let size = optionInfos[0].size;
  let otherLegs = optionInfos.slice(1);

  let allSameExpiration = _lodash.default.every(otherLegs, leg => leg.expiration === expiration);

  let allSameSize = _lodash.default.every(otherLegs, leg => leg.size === size);

  if (!allSameExpiration || !allSameSize) {
    // Different expirations or sizes. Look for calendars, ratios, etc.
    return null;
  }

  let exp = formatExpiration(optionInfos[0].expiration);
  let describer = sameExpDescribers[score];

  if (!describer) {
    return null;
  }

  return describer(exp, optionInfos);
}
//# sourceMappingURL=strategy.js.map