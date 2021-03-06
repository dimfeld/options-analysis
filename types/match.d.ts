import { OptionLeg } from './types';
export interface HasOptionLegs {
    legs: OptionLeg[];
}
export interface MatchingPositionScore<T> {
    score: number;
    overlapping: number;
    position: T;
}
export declare function matchPositions<T extends HasOptionLegs>(trade: HasOptionLegs, positions: T[]): Array<MatchingPositionScore<T>>;
