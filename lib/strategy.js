"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const index_1 = require("./index");
function isShort(leg) { return leg.size < 0; }
exports.isShort = isShort;
function isLong(leg) { return leg.size > 0; }
exports.isLong = isLong;
function isShortPut(leg) { return !leg.call && isShort(leg); }
exports.isShortPut = isShortPut;
function isLongPut(leg) { return !leg.call && isLong(leg); }
exports.isLongPut = isLongPut;
function isShortCall(leg) { return leg.call && isShort(leg); }
exports.isShortCall = isShortCall;
function isLongCall(leg) { return leg.call && isLong(leg); }
exports.isLongCall = isLongCall;
var LegType;
(function (LegType) {
    LegType[LegType["ShortPut"] = 0] = "ShortPut";
    LegType[LegType["LongPut"] = 1] = "LongPut";
    LegType[LegType["ShortCall"] = 2] = "ShortCall";
    LegType[LegType["LongCall"] = 3] = "LongCall";
})(LegType = exports.LegType || (exports.LegType = {}));
function legType(leg) {
    if (isShort(leg)) {
        return leg.call ? LegType.ShortCall : LegType.ShortPut;
    }
    else {
        return leg.call ? LegType.LongCall : LegType.LongPut;
    }
}
exports.legType = legType;
exports.UnknownCombo = 1;
function calculateComboScore(orderedLegs) {
    if (orderedLegs.length > 8) {
        return exports.UnknownCombo;
    }
    let x = 0;
    for (let i = 0; i < orderedLegs.length; i++) {
        let type = legType(orderedLegs[i]);
        x |= type << (i * 2);
    }
    return x;
}
exports.calculateComboScore = calculateComboScore;
function comboScoreFromTypes(types) {
    let x = 0;
    for (let i = 0; i < types.length; i++) {
        x |= types[i] << (i * 2);
    }
    return x;
}
exports.comboScoreFromTypes = comboScoreFromTypes;
exports.comboScores = {
    // Also iron butterfly
    shortIronCondor: comboScoreFromTypes([LegType.LongPut, LegType.ShortPut, LegType.ShortCall, LegType.LongCall]),
    shortInvertedIronCondor: comboScoreFromTypes([LegType.LongPut, LegType.ShortCall, LegType.ShortPut, LegType.LongCall]),
    // TODO maybe other inverted IC combinations?
    shortStrangle: comboScoreFromTypes([LegType.ShortPut, LegType.ShortCall]),
    invertedShortStrangle: comboScoreFromTypes([LegType.ShortCall, LegType.ShortPut]),
    longStrangle: comboScoreFromTypes([LegType.LongPut, LegType.LongCall]),
    invertedLongStrangle: comboScoreFromTypes([LegType.LongCall, LegType.LongPut]),
    putCreditSpread: comboScoreFromTypes([LegType.LongPut, LegType.ShortPut]),
    callCreditSpread: comboScoreFromTypes([LegType.ShortCall, LegType.LongCall]),
    putDebitSpread: comboScoreFromTypes([LegType.ShortPut, LegType.LongPut]),
    callDebitSpread: comboScoreFromTypes([LegType.LongCall, LegType.ShortCall]),
    shortSinglePut: comboScoreFromTypes([LegType.ShortPut]),
    shortSingleCall: comboScoreFromTypes([LegType.ShortCall]),
    longSinglePut: comboScoreFromTypes([LegType.LongPut]),
    longSingleCall: comboScoreFromTypes([LegType.LongCall]),
};
function formatExpiration(expiration) {
    // In the future this will format with a nice month/year/day.
    return expiration;
}
exports.formatExpiration = formatExpiration;
exports.sameExpDescribers = {
    [exports.comboScores.shortIronCondor]: (exp, legs) => {
        let name = legs[1].strike === legs[2].strike ? 'Iron Butterfly' : 'Iron Condor';
        return `${-legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}P ${legs[2].strike}/${legs[3].strike}C ${name}`;
    },
    [exports.comboScores.shortInvertedIronCondor]: (exp, legs) => {
        return `${-legs[0].size} ${exp} Inverted Iron Condor ${legs[0].strike}/${legs[1].strike}P ${legs[2].strike}/${legs[3].strike}C`;
    },
    [exports.comboScores.shortStrangle]: (exp, legs) => {
        if (legs[0].strike === legs[1].strike) {
            return `${-legs[0].size} ${exp} ${legs[0].strike} Short Straddle`;
        }
        else {
            return `${-legs[0].size} ${exp} ${legs[0].strike}P ${legs[1].strike}C Short Strangle`;
        }
    },
    [exports.comboScores.invertedShortStrangle]: (exp, legs) => {
        return `${-legs[0].size} ${exp} ${legs[0].strike}C ${legs[1].strike}P Inverted Short Strangle`;
    },
    [exports.comboScores.longStrangle]: (exp, legs) => {
        if (legs[0].strike === legs[1].strike) {
            return `${legs[0].size} ${exp} ${legs[0].strike} Long Straddle`;
        }
        else {
            return `${legs[0].size} ${exp} ${legs[0].strike}P ${legs[1].strike}C Long Strangle`;
        }
    },
    [exports.comboScores.invertedLongStrangle]: (exp, legs) => {
        if (legs[0].strike === legs[1].strike) {
            return `${legs[0].size} ${exp} ${legs[0].strike} Inverted Long Straddle`;
        }
        else {
            return `${legs[0].size} ${exp} ${legs[0].strike}C ${legs[1].strike}P Interted Long Strangle`;
        }
    },
    [exports.comboScores.putCreditSpread]: (exp, legs) => {
        return `${-legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}P Put Credit Spread`;
    },
    [exports.comboScores.callCreditSpread]: (exp, legs) => {
        return `${-legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}C Call Credit Spread`;
    },
    [exports.comboScores.putDebitSpread]: (exp, legs) => {
        return `${legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}P Put Debit Spread`;
    },
    [exports.comboScores.callDebitSpread]: (exp, legs) => {
        return `${legs[0].size} ${exp} ${legs[0].strike}/${legs[1].strike}C Call Debit Spread`;
    },
    [exports.comboScores.shortSinglePut]: (exp, legs) => {
        return `${-legs[0].size} ${exp} ${legs[0].strike} Short Put`;
    },
    [exports.comboScores.shortSingleCall]: (exp, legs) => {
        return `${-legs[0].size} ${exp} ${legs[0].strike} Short Call`;
    },
    [exports.comboScores.longSinglePut]: (exp, legs) => {
        return `${legs[0].size} ${exp} ${legs[0].strike} Long Put`;
    },
    [exports.comboScores.longSingleCall]: (exp, legs) => {
        return `${legs[0].size} ${exp} ${legs[0].strike} Long Call`;
    },
};
function classify(legs) {
    let optionInfos = _.map(legs, index_1.optionInfoFromLeg);
    let orderedLegs = _.sortBy(optionInfos, ['strike', 'call', 'expiration']);
    let score = calculateComboScore(orderedLegs);
    let expiration = optionInfos[0].expiration;
    let size = optionInfos[0].size;
    let otherLegs = optionInfos.slice(1);
    let allSameExpiration = _.every(otherLegs, (leg) => leg.expiration === expiration);
    let allSameSize = _.every(otherLegs, (leg) => leg.size === size);
    if (!allSameExpiration || !allSameSize) {
        // Different expirations or sizes. Look for calendars, ratios, etc.
        return null;
    }
    let exp = formatExpiration(optionInfos[0].expiration);
    let describer = exports.sameExpDescribers[score];
    if (!describer) {
        return null;
    }
    return describer(exp, optionInfos);
}
exports.classify = classify;
//# sourceMappingURL=strategy.js.map