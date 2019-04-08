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
