export interface TradeLeg {
    size: number;
    price: number;
    symbol: string;
}
export interface Trade {
    price_each: number;
    gross: number;
    legs: TradeLeg[];
}
export interface Position<T extends Trade> {
    symbol: string;
    legs: OptionLeg[];
    trades: T[];
}
export interface OptionLeg {
    id?: string;
    symbol: string;
    size: number;
    price?: number;
}
export interface OptionInfo {
    id?: string;
    underlying: string;
    strike: number;
    expiration: string;
    call: boolean;
    size?: number;
}
export declare function occExpirationFromDate(d: Date): string;
export declare function dateFromOccExpiration(e: string): Date;
export declare function fullSymbol(ol: OptionInfo, padSymbol?: boolean): string;
export declare function optionInfoFromSymbol(symbol: string): OptionInfo;
export declare function optionInfoFromLeg(leg: OptionLeg): OptionInfo;
