import { OptionLeg, OptionInfo } from './types';
export declare type Classifier = (legs: OptionLeg[], score: ComboScore) => string | null;
export declare function isShort(leg: OptionInfo): boolean;
export declare function isLong(leg: OptionInfo): boolean;
export declare function isShortPut(leg: OptionInfo): boolean;
export declare function isLongPut(leg: OptionInfo): boolean;
export declare function isShortCall(leg: OptionInfo): boolean;
export declare function isLongCall(leg: OptionInfo): boolean;
export declare enum LegType {
    ShortPut = 0,
    LongPut = 1,
    ShortCall = 2,
    LongCall = 3
}
export declare function legType(leg: OptionInfo): LegType;
export declare type ComboScore = number;
export declare const UnknownCombo: ComboScore;
export declare function calculateComboScore(orderedLegs: OptionInfo[]): ComboScore;
export declare function comboScoreFromTypes(types: LegType[]): ComboScore;
export declare const comboScores: {
    shortIronCondor: number;
    shortInvertedIronCondor: number;
    shortStrangle: number;
    invertedShortStrangle: number;
    longStrangle: number;
    invertedLongStrangle: number;
    putCreditSpread: number;
    callCreditSpread: number;
    putDebitSpread: number;
    callDebitSpread: number;
    shortSinglePut: number;
    shortSingleCall: number;
    longSinglePut: number;
    longSingleCall: number;
};
export declare function formatExpiration(expiration: string): string;
export declare const sameExpDescribers: {
    [x: number]: (exp: string, legs: OptionInfo[]) => string;
};
export declare function classify(legs: OptionLeg[]): string;
