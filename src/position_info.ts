import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import { Position, Trade } from './types';

export default function positionInfo<T extends Position<TR>, TR extends Trade>(
  position: T,
  fetchQuote: (symbol: string) => number | null
) {
  interface LegData {
    openingIsLong: boolean;
    openBasis: number;
    openLegs: number;
    realized: number;
  }

  let openTotalBasis = 0;
  let maxTotalBasis = 0;

  let legData: Dictionary<LegData> = {};

  position.trades.forEach((trade) => {
    trade.legs.forEach((leg) => {
      let thisLong = leg.size > 0;
      let data = legData[leg.symbol];
      if (!data) {
        data = legData[leg.symbol] = {
          openingIsLong: thisLong,
          openLegs: 0,
          openBasis: 0,
          realized: 0,
        };
      }

      let multiplier = leg.symbol.length > 6 ? 100 : 1;
      let value = leg.size * leg.price * multiplier;

      // If this leg was opened in the same direction as the
      // original leg (or it's the first) then add it to the basis.
      if (thisLong === data.openingIsLong) {
        data.openBasis += value;
        openTotalBasis += value;
      } else {
        let theseLegsBasis =
          data.openBasis * Math.abs(leg.size / data.openLegs);
        data.openBasis -= theseLegsBasis;
        openTotalBasis -= theseLegsBasis;

        let realized = -1 * (value + theseLegsBasis);
        data.realized += realized;
      }

      data.openLegs += leg.size;
    });

    if (Math.abs(openTotalBasis) > Math.abs(maxTotalBasis)) {
      maxTotalBasis = openTotalBasis;
    }
  });

  let underlyingPrice = fetchQuote(position.symbol);
  let currentLegValues = position.legs.map((leg) => {
    let legPrice = fetchQuote(leg.symbol);
    if (!legPrice) {
      return NaN;
    }

    let multiplier = leg.symbol.length > 6 ? 100 : 1;
    return leg.size * legPrice * multiplier;
  });

  let openValue = _.sum(currentLegValues);

  let totalRealized = _.sum(_.map(legData, (leg) => leg.realized));

  let unrealized = openValue - openTotalBasis;
  let openPlPct =
    openTotalBasis === 0 ? 0 : (100 * unrealized) / Math.abs(openTotalBasis);
  let totalPlPct =
    (100 * (unrealized + totalRealized)) / Math.abs(maxTotalBasis);

  return {
    underlyingPrice,

    totalPlPct,
    totalRealized,
    totalBasis: maxTotalBasis,

    openPlPct,
    unrealized,
    openBasis: openTotalBasis,

    netLiquidity: openValue,
  };
}
