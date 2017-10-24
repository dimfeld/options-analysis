import { assert } from 'chai';
import { fullSymbol } from './types';

describe("fullSymbol", function() {
  it("put", function() {
    let leg = {
      symbol: 'ANET',
      strike: 180,
      expiration: '171020',
      call: false,
      size: 2,
    };

    assert.equal(fullSymbol(leg), 'ANET  171020P00180000');
  });

  it("call", function() {
    let leg = {
      symbol: 'ABCDEF',
      strike: 5.75,
      expiration: '171020',
      call: true,
      size: 2,
    };

    assert.equal(fullSymbol(leg), 'ABCDEF171020C00005750');
  });

  it("stock", function() {
    let leg = {
      symbol: 'IBM',
      strike: null,
      expiration: null,
      call: null,
      size: 300,
    };

    assert.equal(fullSymbol(leg), 'IBM');
  });
});
