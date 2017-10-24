import { assert } from 'chai';
import * as position from './position';
import { OptionLeg, fullSymbol } from './types';

describe("simulator", function() {
  it("new position from scratch", function() {
    let sim = new position.PositionSimulator();
    let leg = {
      id: 'abc',
      symbol: 'ANET',
      strike: 180,
      expiration: '171020',
      call: false,
      size: 2,
      price: 4.35,
    };

    let result = sim.addLegs([leg]);

    let expected = [{
      affected: leg,
      changedBy: leg,
      change: position.Change.Opened,
      changeAmount: leg.size,
      totalSize: 2,
      pnl: 0,
      created: true,
    }];

    assert.deepEqual(result, expected, "check expected");
  });

  it("multiple new positions from scratch");

  it("adding to a position");
  it("closing a position");
  it("partial close");
  it("rolling");
  it("closing short and opening long at same strike");
  it("closing long and opening short at same strike");
  it("single list of options modifies the same one multiple times");

});
