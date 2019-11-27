"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchPositions = matchPositions;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function matchPositions(trade, positions) {
  let legs = trade.legs;
  return _lodash.default.chain(positions).map(position => {
    let overlapping = _lodash.default.reduce(legs, (acc, leg) => {
      let found_leg = _lodash.default.find(position.legs, p_leg => p_leg.symbol === leg.symbol);

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
  }).filter(x => x.score > 0).orderBy(x => x.score, 'desc').value();
}
//# sourceMappingURL=match.js.map