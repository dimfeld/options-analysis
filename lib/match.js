"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function matchPositions(trade, positions) {
    let legs = trade.legs;
    return _.chain(positions)
        .map((position) => {
        let overlapping = _.reduce(legs, (acc, leg) => {
            let found_leg = _.find(position.legs, (p_leg) => p_leg.symbol === leg.symbol);
            if (found_leg) {
                acc += 1;
            }
            return acc;
        }, 0);
        return {
            score: overlapping / position.legs.length,
            overlapping,
            position,
        };
    })
        .filter((x) => x.score > 0)
        .orderBy((x) => x.score, 'desc')
        .value();
}
exports.matchPositions = matchPositions;
//# sourceMappingURL=match.js.map