"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchPositions = matchPositions;

var _ = _interopRequireWildcard(require("lodash"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function matchPositions(trade, positions) {
  let legs = trade.legs;
  return _.chain(positions).map(position => {
    let overlapping = _.reduce(legs, (acc, leg) => {
      let found_leg = _.find(position.legs, p_leg => p_leg.symbol === leg.symbol);

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