import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import { Position, Trade } from './types';

export default function positionInfo<T extends Position<TR>, TR extends Trade>(
  position: T,
  fetchQuote: (symbol: string) => number | null
) {
  interface LegData {
    openingIsLong: boolean;
    basis: number;
    openLegs: number;
    maxLegs: number;
    realized: number;
  }

  let legData: Dictionary<LegData> = {};

  position.trades.forEach((trade) => {
    trade.legs.forEach((leg) => {
      let thisLong = leg.size > 0;
      let data = legData[leg.symbol];
      if (!data) {
        data = legData[leg.symbol] = {
          openingIsLong: thisLong,
          openLegs: 0,
          maxLegs: 0,
          basis: 0,
          realized: 0,
        };
      }

      let multiplier = leg.symbol.length > 6 ? 100 : 1;
      let value = leg.size * leg.price * multiplier;

      // If this leg was opened in the same direction as the
      // original leg (or it's the first) then add it to the basis.
      if (thisLong === data.openingIsLong) {
        data.basis += value;
        data.maxLegs += leg.size;
      } else {
        let realized = data.basis * Math.abs(leg.size / data.maxLegs) + value;
        data.realized += realized;
      }

      data.openLegs += leg.size;
    });
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
  let totalBasis = _.sum(_.map(legData, (leg) => leg.basis));
  let openBasis = _.sum(
    _.map(legData, (leg) => leg.basis * (leg.openLegs / leg.maxLegs))
  );

  let unrealized = openValue - openBasis;
  let openPlPct = unrealized / openBasis;
  let totalPlPct = (unrealized + totalRealized) / totalBasis;

  return {
    underlyingPrice,

    totalPlPct,
    totalRealized,
    totalBasis,

    openPlPct,
    unrealized,
    openBasis,
  };
}
