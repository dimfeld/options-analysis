"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
function positionInfo(position, fetchQuote) {
    var legData = {};
    position.trades.forEach(function (trade) {
        trade.legs.forEach(function (leg) {
            var thisLong = leg.size > 0;
            var data = legData[leg.symbol];
            if (!data) {
                data = legData[leg.symbol] = {
                    openingIsLong: thisLong,
                    openLegs: 0,
                    maxLegs: 0,
                    basis: 0,
                    realized: 0,
                };
            }
            var multiplier = leg.symbol.length > 6 ? 100 : 1;
            var value = leg.size * leg.price * multiplier;
            // If this leg was opened in the same direction as the
            // original leg (or it's the first) then add it to the basis.
            if (thisLong === data.openingIsLong) {
                data.basis += value;
                data.maxLegs += leg.size;
            }
            else {
                var realized = data.basis * Math.abs(leg.size / data.maxLegs) + value;
                data.realized += realized;
            }
            data.openLegs += leg.size;
        });
    });
    var underlyingPrice = fetchQuote(position.symbol);
    var currentLegValues = position.legs.map(function (leg) {
        var legPrice = fetchQuote(leg.symbol);
        if (!legPrice) {
            return NaN;
        }
        var multiplier = leg.symbol.length > 6 ? 100 : 1;
        return leg.size * legPrice * multiplier;
    });
    var openValue = _.sum(currentLegValues);
    var totalRealized = _.sum(_.map(legData, function (leg) { return leg.realized; }));
    var totalBasis = _.sum(_.map(legData, function (leg) { return leg.basis; }));
    var openBasis = _.sum(_.map(legData, function (leg) { return leg.basis * (leg.openLegs / leg.maxLegs); }));
    var unrealized = openValue - openBasis;
    var openPlPct = unrealized / openBasis;
    var totalPlPct = (unrealized + totalRealized) / totalBasis;
    return {
        underlyingPrice: underlyingPrice,
        totalPlPct: totalPlPct,
        totalRealized: totalRealized,
        totalBasis: totalBasis,
        openPlPct: openPlPct,
        unrealized: unrealized,
        openBasis: openBasis,
    };
}
exports.default = positionInfo;
//# sourceMappingURL=position_info.js.map