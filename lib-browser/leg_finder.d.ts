import * as _ from 'lodash';
import { ContractInfo } from 'tda-api';
export declare type StrikeMap = _.Dictionary<ContractInfo[]>;
export declare type ExpirationDateMap = _.Dictionary<StrikeMap>;
export declare function closestDeltas(strikes: StrikeMap, deltas: number[]): {
    target: number;
    contract: ContractInfo;
}[];
interface ClosestDte {
    target: number;
    dte: number;
    expiration: string;
    difference: number;
    strikes: StrikeMap;
}
export declare function closestAfterDte(dates: ExpirationDateMap, dteTarget: string[]): ClosestDte[];
export interface AnalyzeSideOptions {
    dte: string[];
    delta: number[];
}
export declare function analyzeSide(config: AnalyzeSideOptions, allExpirations: ExpirationDateMap): {
    target: number;
    dte: number;
    expiration: string;
    difference: number;
    strikes: _.Dictionary<ContractInfo[]>;
    deltas: {
        target: number;
        contract: ContractInfo;
    }[];
}[];
export interface FilterLiquidityArguments {
    maxSpreadPercent?: number;
    minVolume?: number;
    minOpenInterest?: number;
}
export interface LiquidityInfo {
    spreadPercent?: number;
    totalVolume?: number;
    openInterest?: number;
}
export declare function filterLiquidity(config: FilterLiquidityArguments, data: LiquidityInfo): boolean;
export interface AnalyzeLiquidityOptions {
    symbol: string;
    callExpDateMap: ExpirationDateMap;
    putExpDateMap: ExpirationDateMap;
}
export declare function analyzeLiquidity(config: AnalyzeSideOptions & FilterLiquidityArguments, chain: AnalyzeLiquidityOptions): {
    symbol: string;
    results: {
        symbol: string;
        delta: number;
        putCall: string;
        strikePrice: number;
        daysToExpiration: number;
        bid: number;
        ask: number;
        totalVolume: number;
        openInterest: number;
        description: string;
        exchangeName: string;
        last: number;
        mark: number;
        bidSize: number;
        askSize: number;
        lastSize: number;
        highPrice: number;
        lowPrice: number;
        openPrice: number;
        closePrice: number;
        tradeDate: number;
        tradeTimeInLong: number;
        quoteTimeInLong: number;
        netChange: number;
        volatility: number;
        gamma: number;
        theta: number;
        vega: number;
        rho: number;
        timeValue: number;
        theoreticalOptionValue: number;
        theoreticalVolatility: number;
        optionDeliverablesList: any;
        expirationDate: number;
        expirationType: string;
        lastTradingDay: number;
        multiplier: number;
        settlementType: string;
        deliverableNote: string;
        isIndexOption: boolean;
        percentChange: number;
        markChange: number;
        markPercentChange: number;
        inTheMoney: boolean;
        mini: boolean;
        nonStandard: boolean;
        expiration: string;
        targetDte: number;
        targetDelta: number;
        spreadPercent: number;
    }[];
};
export {};
