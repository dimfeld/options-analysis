import { Dictionary } from 'lodash';
import { Position, Trade, PositionLegInfo } from './types';
export default function positionInfo<T extends Position<TR>, TR extends Trade>(position: T, fetchQuote: (symbol: string) => number | null): {
    underlyingPrice: number;
    totalPlPct: number;
    totalRealized: number;
    totalBasis: number;
    openPlPct: number;
    unrealized: number;
    openBasis: number;
    netLiquidity: number;
    legData: Dictionary<PositionLegInfo>;
};
