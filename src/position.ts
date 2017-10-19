import * as _ from 'lodash';
import { OptionLeg, fullSymbol } from './types';

enum Change {
  // The leg in `changedBy` closed the affected leg.
  Closed,

  // A new position was opened by this leg. `affected` and `changedBy` will be the same object.
  Opened,

  // A position was partially closed by a leg. This will always be followed by an Closed result for the closed portion of the legs.
  // When the result is Reduced, `affected.size` will reflect the new number of options in the leg.
  Reduced,
}

export interface SimulationStep {
  affected : OptionLeg;
  changedBy: OptionLeg;
  change: Change;
  changeAmount : number;
  totalSize: number;
  pnl? : number;
}

export type SimulationResults = SimulationStep[];

// Simulate executions and their effect on a portfolio. This accounts for
export class PositionSimulator {

  legs : {[key:string]: OptionLeg[]};

  addLegs(legs : OptionLeg[]) : SimulationResults {
    return _.flatMap(legs, (leg) => {
      let symbol = fullSymbol(leg);
      return this.addLegbyFullSymbol(symbol, leg);
    });
  }

  addLegbyFullSymbol(fullSymbol : string, leg : OptionLeg) : SimulationResults {
    let existing = this.legs[fullSymbol];
    if(!existing || !existing.length) {
      this.legs[fullSymbol] = [leg];
      return [{
        affected: leg,
        changedBy: leg,
        change: Change.Opened,
        changeAmount: leg.size,
        totalSize: leg.size,
        pnl: 0, // Never any P&L on an opening.
      }];
    } else if(existing[0].size * leg.size > 0) {
      // The size of the existing legs and the new leg have the same sign, so this is expanding an existing position.
      existing.push(leg);
      return [{
        affected: leg,
        changedBy: leg,
        change: Change.Opened,
        changeAmount: leg.size,
        totalSize: _.sumBy(existing, 'size'),
        pnl: 0,
      }];
    }

    // If we get down to here, then it's closing a position.
    let remaining = Math.abs(leg.size);
    let result : SimulationResults = [];
    let newExisting = [];
    _.each(existing, (el) => {
      let absSize = Math.abs(el.size);
      if(absSize >= remaining) {
        // The new leg closes out this one.
        result.push({
          affected: el,
          changedBy: leg,
          change: Change.Closed,
          changeAmount: leg.size,
          totalSize: _.sumBy(existing, 'size') - leg.size,
          pnl: -(leg.price - el.price),
        });

        remaining -= absSize;
      } else if(el.size !== 0) {
        // The new leg partialy closes this one.
        // TODO
      } else {
        newExisting.push(el);
      }
    });

    if(remaining > 0) {
      // This leg not only closed some positions, but opened new ones.
      // TODO
    }

    if(newExisting.length) {
      this.legs[fullSymbol] = newExisting;
    } else {
      this.legs[fullSymbol] = undefined;
    }


    return result;
  }
}
