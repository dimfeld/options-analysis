import { assert } from 'chai';
import { fullSymbol, optionInfoFromSymbol, optionInfoFromLeg } from './types';

describe("fullSymbol", function() {
  it("put", function() {
    let leg = {
      underlying: 'ANET',
      strike: 180,
      expiration: '171020',
      call: false,
      size: 2,
    };

    assert.equal(fullSymbol(leg), 'ANET  171020P00180000');
  });

  it("call", function() {
    let leg = {
      underlying: 'ABCDEF',
      strike: 5.75,
      expiration: '171020',
      call: true,
      size: 2,
    };

    assert.equal(fullSymbol(leg), 'ABCDEF171020C00005750');
  });

  it("stock", function() {
    let leg = {
      underlying: 'IBM',
      strike: null,
      expiration: null,
      call: null,
      size: 300,
    };

    assert.equal(fullSymbol(leg), 'IBM');
  });
});

describe('optionInfoFromSymbol', function() {
  it('call', function() {
    let expected = {
      underlying: 'ABCDEF',
      strike: 5.75,
      expiration: '171020',
      call: true,
    };

    let seen = optionInfoFromSymbol('ABCDEF171020C00005750');
    assert.deepEqual(seen, expected);
  });

  it('put', function() {
    let expected = {
      underlying: 'ANET',
      strike: 180,
      expiration: '171020',
      call: false,
    };

    let seen = optionInfoFromSymbol('ANET  171020P00180000');
    assert.deepEqual(seen, expected);
  });

  it('stock', function() {
    let expected = {
      underlying: 'ANET',
      expiration: undefined,
      call: undefined,
      strike: undefined,
    };

    let seen = optionInfoFromSymbol('ANET');
    assert.deepEqual(seen, expected);
  })
});
