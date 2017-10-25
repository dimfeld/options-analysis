import { assert } from 'chai';
import * as position from './position';
import { OptionLeg, fullSymbol } from './types';
import * as _ from 'lodash';

function expectedLegs(legs : OptionLeg[]) {
  return _.transform(legs, (memo, leg) => {
    let fs = fullSymbol(leg);
    let list = memo[fs] as OptionLeg[];
    if(list) {
      list.push(leg);
    } else {
      memo[fs] = [leg];
    }
  }, {});
}

function checkSimState(sim, legs, description = 'simulator state') {
  // Empty lists are undefined. Filter those out of the check so that deepEqual doesn't count them.
  let checkLegs = _.reduce(sim.legs, (memo, list, key) => {
    if(list !== undefined) {
      memo[key] = list;
    }
    return memo;
  }, {});
  assert.deepEqual(checkLegs, expectedLegs(legs), description);
}

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
    checkSimState(sim, [leg]);
  });

  it("multiple new positions from scratch", function() {
    let sim = new position.PositionSimulator();
    let legs = [
      {
        id: 'abc',
        symbol: 'ANET',
        strike: 180,
        expiration: '171020',
        call: false,
        size: 2,
        price: 4.35,
      },
      {
        id: 'def',
        symbol: 'ANET',
        strike: 170,
        expiration: '171020',
        call: false,
        size: -2,
        price: 4.35,
      }
    ];

    let result = sim.addLegs(legs);

    let expected = [
      {
        affected: legs[0],
        changedBy: legs[0],
        change: position.Change.Opened,
        changeAmount: legs[0].size,
        totalSize: 2,
        pnl: 0,
        created: true,
      },
      {
        affected: legs[1],
        changedBy: legs[1],
        change: position.Change.Opened,
        changeAmount: legs[1].size,
        totalSize: -2,
        pnl: 0,
        created: true,
      },
    ];

    assert.deepEqual(result, expected, "check expected");
    checkSimState(sim, legs);
  });

  it("adding to a position", function() {
    let legs = [
      {
        id: 'abc',
        symbol: 'ANET',
        strike: 180,
        expiration: '171020',
        call: false,
        size: 2,
        price: 4.35,
      },
      {
        id: 'def',
        symbol: 'ANET',
        strike: 170,
        expiration: '171020',
        call: false,
        size: -2,
        price: 4.35,
      },
    ];

    let sim = new position.PositionSimulator(legs);
    checkSimState(sim, legs, 'initial sim state');

    let newLegs = [
      {
        id: 'aaa',
        symbol: 'ANET',
        strike: 180,
        expiration: '171020',
        call: false,
        size: 2,
        price: 4.35,
      },
      {
        id: 'bbb',
        symbol: 'ANET',
        strike: 170,
        expiration: '171020',
        call: false,
        size: -2,
        price: 4.35,
      },
    ];

    let result = sim.addLegs(newLegs);
    let expectedResult = [
      {
        affected: newLegs[0],
        changedBy: newLegs[0],
        change: position.Change.Opened,
        changeAmount: newLegs[0].size,
        totalSize: 4,
        pnl: 0,
        created: true,
      },
      {
        affected: newLegs[1],
        changedBy: newLegs[1],
        change: position.Change.Opened,
        changeAmount: newLegs[1].size,
        totalSize: -4,
        pnl: 0,
        created: true,
      },
    ];

    assert.deepEqual(result, expectedResult, 'added legs result');
    checkSimState(sim, legs.concat(newLegs), 'sim state after add');
  });

  it("closing a position", function() {
    let legs = [
      {
        id: 'longStrike',
        symbol: 'ANET',
        strike: 180,
        expiration: '171020',
        call: false,
        size: 2,
        price: 4.35,
      },
      {
        id: 'shortStrike',
        symbol: 'ANET',
        strike: 170,
        expiration: '171020',
        call: false,
        size: -2,
        price: 4.35,
      },
    ];

    let sim = new position.PositionSimulator(legs);
    checkSimState(sim, legs, 'initial sim state');

    let closingLegs = [
      {
        id: 'closingShortStrike',
        symbol: 'ANET',
        strike: 170,
        expiration: '171020',
        call: false,
        size: 2,
        price: 2.45,
      },
      {
        id: 'closingLongStrike',
        symbol: 'ANET',
        strike: 180,
        expiration: '171020',
        call: false,
        size: -2,
        price: 2.45,
      },
    ];

    let result = sim.addLegs([closingLegs[0]]);
    let expected = [
      {
        affected: legs[1],
        changedBy: closingLegs[0],
        change: position.Change.Closed,
        changeAmount: 2,
        totalSize: 0,
        created: false,
        pnl: (legs[1].price - closingLegs[0].price) * 2,
      },
    ];

    assert.deepEqual(result, expected, 'closing short leg');
    checkSimState(sim, [legs[0]], 'sim state after close');

    result = sim.addLegs([closingLegs[1]]);
    expected = [
      {
        affected: legs[0],
        changedBy: closingLegs[1],
        change: position.Change.Closed,
        changeAmount: -2,
        totalSize: 0,
        created: false,
        pnl: (legs[0].price - closingLegs[1].price) * -2,
      }
    ];

    assert.deepEqual(result, expected, 'closing long leg');
    checkSimState(sim, [], 'sim state after close');

  });

  it("partial close", function() {
    let legs = [
      {
        id: 'longStrike',
        symbol: 'ANET',
        strike: 180,
        expiration: '171020',
        call: false,
        size: 3,
        price: 4.35,
      },
      {
        id: 'shortStrike',
        symbol: 'ANET',
        strike: 170,
        expiration: '171020',
        call: false,
        size: -3,
        price: 4.35,
      },
    ];

    let sim = new position.PositionSimulator(legs);
    checkSimState(sim, legs, 'initial sim state');

    let closingLegs = [
      {
        id: 'closingShortStrike',
        symbol: 'ANET',
        strike: 170,
        expiration: '171020',
        call: false,
        size: 1,
        price: 2.45,
      },
      {
        id: 'closingLongStrike',
        symbol: 'ANET',
        strike: 180,
        expiration: '171020',
        call: false,
        size: -1,
        price: 2.45,
      },
    ];

    let result = sim.addLegs([closingLegs[0]]);
    assert.notEqual(result[1].affected.id, legs[1].id, 'new leg object gets new id')
    assert.isOk(result[1].affected.id, 'new leg object gets new id');
    result[1].affected.id = 'newid'; // Set it to something known for the assert below.
    let reducedLeg = _.extend({}, legs[1], { size: -2 });
    let expected = [
      {
        affected: reducedLeg,
        changedBy: closingLegs[0],
        change: position.Change.Reduced,
        changeAmount: 1,
        totalSize: -2,
        created: false,
        pnl: null,

      },
      {
        affected: _.extend({}, legs[1], { size: -1, id: 'newid' }),
        changedBy: closingLegs[0],
        change: position.Change.Closed,
        changeAmount: 1,
        totalSize: -2,
        created: true,
        pnl: (legs[1].price - closingLegs[0].price),
      }
    ];

    assert.deepEqual(result, expected, 'partial close short leg');
    checkSimState(sim, [reducedLeg, legs[0]], 'sim state after close');

    // result = sim.addLegs([closingLegs[1]]);
    // expected = [
    //   {
    //     affected: legs[0],
    //     changedBy: closingLegs[1],
    //     change: position.Change.Closed,
    //     changeAmount: -2,
    //     totalSize: 0,
    //     created: false,
    //     pnl: (legs[0].price - closingLegs[1].price) * -2,
    //   }
    // ];

    // assert.deepEqual(result, expected, 'closing long leg');
    // checkSimState(sim, [], 'sim state after close');
  });

  it("rolling");
  it("closing short and opening long at same strike");
  it("closing long and opening short at same strike");
  it("single list of options modifies the same one multiple times");

});
