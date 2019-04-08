"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
function match_positions(trade, positions) {
    var legs = trade.legs;
    return _.chain(positions)
        .map(function (position) {
        var overlapping = _.reduce(legs, function (acc, leg) {
            var found_leg = _.find(position.legs, function (p_leg) { return p_leg.symbol === leg.symbol; });
            if (found_leg) {
                acc += 1;
            }
            return acc;
        }, 0);
        return {
            score: overlapping / position.legs.length,
            overlapping: overlapping,
            position: position,
        };
    })
        .filter(function (x) { return x.score > 0; })
        .orderBy(function (x) { return x.score; }, 'desc')
        .value();
}
exports.match_positions = match_positions;
//# sourceMappingURL=match.js.map