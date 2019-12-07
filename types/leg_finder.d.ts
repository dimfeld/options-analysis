import { Dictionary } from 'lodash';
import { ContractInfo } from 'tda-api';
export declare type StrikeMap = Dictionary<ContractInfo[]>;
export declare type ExpirationDateMap = Dictionary<StrikeMap>;
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
    strikes: StrikeMap;
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
        description: string;
        mark: number;
        putCall: string;
        exchangeName: string;
        bid: number;
        ask: number;
        last: number;
        bidSize: number;
        askSize: number;
        lastSize: number;
        highPrice: number;
        lowPrice: number;
        openPrice: number;
        closePrice: number;
        totalVolume: number;
        tradeDate: number;
        tradeTimeInLong: number;
        quoteTimeInLong: number;
        netChange: number;
        volatility: number;
        delta: number;
        gamma: number;
        theta: number;
        vega: number;
        rho: number;
        openInterest: number;
        timeValue: number;
        theoreticalOptionValue: number;
        theoreticalVolatility: number;
        optionDeliverablesList: any;
        strikePrice: number;
        expirationDate: number;
        daysToExpiration: number;
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
