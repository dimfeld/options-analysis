"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = positionInfo;

var _ = _interopRequireWildcard(require("lodash"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function positionInfo(position, fetchQuote) {
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
          basis: 0,
          realized: 0
        };
      }

      let multiplier = leg.symbol.length > 6 ? 100 : 1;
      let value = leg.size * leg.price * multiplier; // If this leg was opened in the same direction as the
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
  let currentLegValues = position.legs.map(leg => {
    let legPrice = fetchQuote(leg.symbol);

    if (!legPrice) {
      return NaN;
    }

    let multiplier = leg.symbol.length > 6 ? 100 : 1;
    return leg.size * legPrice * multiplier;
  });

  let openValue = _.sum(currentLegValues);

  let totalRealized = _.sum(_.map(legData, leg => leg.realized));

  let totalBasis = _.sum(_.map(legData, leg => leg.basis));

  let openBasis = _.sum(_.map(legData, leg => leg.basis * (leg.openLegs / leg.maxLegs)));

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
    openBasis
  };
}
//# sourceMappingURL=position_info.js.map