"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = positionInfo;

var _sum = _interopRequireDefault(require("lodash/sum"));

var _map = _interopRequireDefault(require("lodash/map"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function positionInfo(position, fetchQuote) {
  let openTotalBasis = 0;
  let maxTotalBasis = 0;
  let legData = {};
  position.trades.forEach(trade => {
    trade.legs.forEach(leg => {
      let thisLong = leg.size > 0;
      let data = legData[leg.symbol];

      if (!data) {
        data = legData[leg.symbol] = {
          openingIsLong: thisLong,
          openLegs: 0,
          maxLegs: 0,
          totalBasis: 0,
          openBasis: 0,
          realized: 0,
          multiplier: leg.symbol.length > 6 ? 100 : 1
        };
      }

      let value = leg.size * leg.price * data.multiplier; // If this leg was opened in the same direction as the
      // original leg (or it's the first) then add it to the basis.

      if (thisLong === data.openingIsLong) {
        data.maxLegs += leg.size;
        data.openBasis += value;
        openTotalBasis += value;
      } else {
        let theseLegsBasis = data.openBasis * Math.abs(leg.size / data.openLegs);
        data.openBasis -= theseLegsBasis;
        openTotalBasis -= theseLegsBasis;
        let realized = -1 * (value + theseLegsBasis);
        data.realized += realized;
      }

      if (Math.abs(data.openBasis) > Math.abs(data.totalBasis)) {
        data.totalBasis = data.openBasis;
      }

      data.openLegs += leg.size;
    });

    if (Math.abs(openTotalBasis) > Math.abs(maxTotalBasis)) {
      maxTotalBasis = openTotalBasis;
    }
  });
  let underlyingPrice = fetchQuote(position.symbol);
  let currentLegValues = position.legs.map(leg => {
    let legPrice = fetchQuote(leg.symbol);

    if (!legPrice) {
      return NaN;
    }

    let multiplier = leg.symbol.length > 6 ? 100 : 1;
    return leg.size * legPrice * multiplier;
  });
  let openValue = (0, _sum.default)(currentLegValues);
  let totalRealized = (0, _sum.default)((0, _map.default)(legData, leg => leg.realized));
  let unrealized = openValue - openTotalBasis;
  let openPlPct = openTotalBasis === 0 ? 0 : 100 * unrealized / Math.abs(openTotalBasis);
  let totalPlPct = 100 * (unrealized + totalRealized) / Math.abs(maxTotalBasis);
  return {
    underlyingPrice,
    totalPlPct,
    totalRealized,
    totalBasis: maxTotalBasis,
    openPlPct,
    unrealized,
    openBasis: openTotalBasis,
    netLiquidity: openValue,
    legData
  };
}
//# sourceMappingURL=position_info.js.map