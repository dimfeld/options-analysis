"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchPositions = matchPositions;

var _orderBy = _interopRequireDefault(require("lodash/orderBy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function matchPositions(trade, positions) {
  let legs = trade.legs;
  let matched = positions.map(position => {
    let overlapping = legs.reduce((acc, leg) => {
      let found_leg = position.legs.find(p_leg => p_leg.symbol === leg.symbol);

      if (found_leg) {
        acc += 1;
      }

      return acc;
    }, 0);
    return {
      score: overlapping / position.legs.length,
      overlapping,
      position
    };
  }).filter(x => x.score > 0);
  return (0, _orderBy.default)(matched, x => x.score, 'desc');
}
//# sourceMappingURL=match.js.map