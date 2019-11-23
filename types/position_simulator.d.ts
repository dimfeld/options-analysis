import { OptionLeg } from './types';
export declare enum Change {
    Closed = 0,
    Opened = 1,
    Reduced = 2
}
export interface SimulationStep {
    affected: OptionLeg;
    changedBy: OptionLeg;
    change: Change;
    changeAmount: number;
    totalSize: number;
    pnl?: number;
    created: boolean;
}
export declare type SimulationResults = SimulationStep[];
export declare class PositionSimulator {
    legs: {
        [key: string]: OptionLeg[];
    };
    constructor(initial?: OptionLeg[]);
    getFlattenedList(): OptionLeg[];
    addLegs(legs: OptionLeg[]): SimulationResults;
    addLeg(leg: OptionLeg): SimulationResults;
}
