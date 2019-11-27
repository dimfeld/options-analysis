"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PositionSimulator = exports.Change = void 0;

var _ = _interopRequireWildcard(require("lodash"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

let Change;
exports.Change = Change;

(function (Change) {
  Change[Change["Closed"] = 0] = "Closed";
  Change[Change["Opened"] = 1] = "Opened";
  Change[Change["Reduced"] = 2] = "Reduced";
})(Change || (exports.Change = Change = {}));

// Simulate executions and their effect on a portfolio.
class PositionSimulator {
  constructor(initial) {
    this.legs = {};

    _.each(initial, leg => {
      let symbol = leg.symbol;
      let list = this.legs[symbol];

      if (list) {
        list.push(leg);
      } else {
        this.legs[symbol] = [leg];
      }
    });
  }

  getFlattenedList() {
    return _.chain(this.legs).map((legs, symbol) => {
      let size = _.sumBy(legs, 'size');

      if (size !== 0) {
        return {
          symbol,
          size
        };
      }
    }).compact().value();
  }

  addLegs(legs) {
    return _.flatMap(legs, leg => this.addLeg(leg));
  }

  addLeg(leg) {
    let symbol = leg.symbol;
    let existing = this.legs[symbol];

    if (!existing || !existing.length) {
      this.legs[symbol] = [leg];
      return [{
        affected: leg,
        changedBy: leg,
        change: Change.Opened,
        changeAmount: leg.size,
        totalSize: leg.size,
        created: true,
        pnl: 0 // Never any P&L on an opening.

      }];
    } else if (existing[0].size * leg.size > 0) {
      // The size of the existing legs and the new leg have the same sign, so this is expanding an existing position.
      existing.push(leg);
      return [{
        affected: leg,
        changedBy: leg,
        change: Change.Opened,
        changeAmount: leg.size,
        totalSize: _.sumBy(existing, 'size'),
        created: true,
        pnl: 0
      }];
    } // If we get down to here, then it's closing a position.


    let result = [];
    let newExisting = [];
    let totalSize = _.sumBy(existing, 'size') + leg.size;
    let remaining = leg.size;
    let absRemaining = Math.abs(remaining);

    _.each(existing, el => {
      let absSize = Math.abs(el.size);

      if (absSize <= absRemaining) {
        // The new leg completely closes out this one.
        result.push({
          affected: el,
          changedBy: leg,
          change: Change.Closed,
          changeAmount: -el.size,
          totalSize,
          created: false,
          pnl: (el.price - leg.price) * el.size
        });
        remaining -= el.size;
        absRemaining -= absSize;
      } else if (absRemaining !== 0) {
        // The new leg partially closes this one, so split it into two legs, one that is the closed portion and one that is the
        // still-active portion.
        el.size += remaining;
        newExisting.push(el); // The closed leg should be the newly created object, so that the one that remains in the system is the same leg that was originally added.

        let closedLeg = _.clone(el);

        closedLeg.size = -remaining;
        result.push({
          affected: el,
          changedBy: leg,
          change: Change.Reduced,
          changeAmount: remaining,
          totalSize,
          created: false,
          pnl: null
        }, {
          affected: closedLeg,
          changedBy: leg,
          change: Change.Closed,
          changeAmount: remaining,
          totalSize,
          created: true,
          pnl: (el.price - leg.price) * remaining
        });
        remaining = absRemaining = 0;
      } else {
        // No effect since the new leg has already been applied fully.
        newExisting.push(el);
      }
    });

    if (absRemaining > 0) {
      // This leg not only closed some positions, but opened new ones.
      let newLeg = _.clone(leg);

      newLeg.size = remaining;
      result.push({
        affected: newLeg,
        changedBy: leg,
        change: Change.Opened,
        changeAmount: newLeg.size,
        totalSize,
        created: true,
        pnl: null
      });
    }

    this.legs[symbol] = newExisting.length ? newExisting : undefined;
    return result;
  }

}

exports.PositionSimulator = PositionSimulator;
//# sourceMappingURL=position_simulator.js.map