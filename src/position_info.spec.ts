import positionInfo from './position_info';
import { Position, Trade } from './types';

function mockQuote(symbol: string) {
  switch (symbol) {
    case 'ANET':
      return 250;
    case 'ANET  171020P00190000':
      return 4.5;
    case 'ANET  171020P00180000':
      return 3;
  }
}

test('single long option', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 2,
        gross: -200,
        legs: [{ symbol: 'ANET  171020P00180000', size: 1, price: 2 }],
      },
    ],
    legs: [{ symbol: 'ANET  171020P00180000', size: 1 }],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: 50,
    totalRealized: 0,
    totalBasis: 200,

    openPlPct: 50,
    unrealized: 100,
    openBasis: 200,

    netLiquidity: 300,
  });
});

test('single short option', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 2,
        gross: 200,
        legs: [{ symbol: 'ANET  171020P00180000', size: -1, price: 2 }],
      },
    ],
    legs: [{ symbol: 'ANET  171020P00180000', size: -1 }],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: -50,
    totalRealized: 0,
    totalBasis: -200,

    openPlPct: -50,
    unrealized: -100,
    openBasis: -200,

    netLiquidity: -300,
  });
});

test('losing credit spread', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 1,
        gross: 100,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -1, price: 2 },
          { symbol: 'ANET  171020P00180000', size: 1, price: 1 },
        ],
      },
    ],
    legs: [
      { symbol: 'ANET  171020P00190000', size: -1 },
      { symbol: 'ANET  171020P00180000', size: 1 },
    ],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: -50,
    totalRealized: 0,
    totalBasis: -100,

    openPlPct: -50,
    unrealized: -50,
    openBasis: -100,

    netLiquidity: -150,
  });
});

test('winning credit spread', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 2,
        gross: 200,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -1, price: 6 },
          { symbol: 'ANET  171020P00180000', size: 1, price: 4 },
        ],
      },
    ],
    legs: [
      { symbol: 'ANET  171020P00190000', size: -1 },
      { symbol: 'ANET  171020P00180000', size: 1 },
    ],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: 25,
    totalRealized: 0,
    totalBasis: -200,

    openPlPct: 25,
    unrealized: 50,
    openBasis: -200,

    netLiquidity: -150,
  });
});

test('winning debit spread', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 1,
        gross: -100,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 1, price: 2 },
          { symbol: 'ANET  171020P00180000', size: -1, price: 1 },
        ],
      },
    ],
    legs: [
      { symbol: 'ANET  171020P00190000', size: 1 },
      { symbol: 'ANET  171020P00180000', size: -1 },
    ],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: 50,
    totalRealized: 0,
    totalBasis: 100,

    openPlPct: 50,
    unrealized: 50,
    openBasis: 100,

    netLiquidity: 150,
  });
});

test('losing debit spread', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 2,
        gross: -200,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 1, price: 6 },
          { symbol: 'ANET  171020P00180000', size: -1, price: 4 },
        ],
      },
    ],
    legs: [
      { symbol: 'ANET  171020P00190000', size: 1 },
      { symbol: 'ANET  171020P00180000', size: -1 },
    ],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: -25,
    totalRealized: 0,
    totalBasis: 200,

    openPlPct: -25,
    unrealized: -50,
    openBasis: 200,

    netLiquidity: 150,
  });
});

test('closed single long option', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 2,
        gross: -200,
        legs: [{ symbol: 'ANET  171020P00180000', size: 1, price: 2 }],
      },
      {
        price_each: 3,
        gross: 300,
        legs: [{ symbol: 'ANET  171020P00180000', size: -1, price: 3 }],
      },
    ],
    legs: [],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: 50,
    totalRealized: 100,
    totalBasis: 200,

    openPlPct: 0,
    unrealized: 0,
    openBasis: 0,

    netLiquidity: 0,
  });
});

test('closed single short option', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 2,
        gross: 200,
        legs: [{ symbol: 'ANET  171020P00180000', size: -1, price: 2 }],
      },

      {
        price_each: 3,
        gross: -300,
        legs: [{ symbol: 'ANET  171020P00180000', size: 1, price: 3 }],
      },
    ],
    legs: [],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: -50,
    totalRealized: -100,
    totalBasis: -200,

    openPlPct: 0,
    unrealized: 0,
    openBasis: 0,

    netLiquidity: 0,
  });
});

test('closed losing credit spread', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 1,
        gross: 100,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -1, price: 2 },
          { symbol: 'ANET  171020P00180000', size: 1, price: 1 },
        ],
      },

      {
        price_each: 1.25,
        gross: -125,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 1, price: 2.75 },
          { symbol: 'ANET  171020P00180000', size: -1, price: 1.5 },
        ],
      },
    ],
    legs: [],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: -25,
    totalRealized: -25,
    totalBasis: -100,

    openPlPct: 0,
    unrealized: 0,
    openBasis: 0,

    netLiquidity: 0,
  });
});

test('closed winning credit spread', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 2,
        gross: 200,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -1, price: 6 },
          { symbol: 'ANET  171020P00180000', size: 1, price: 4 },
        ],
      },

      {
        price_each: 0.5,
        gross: -50,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 1, price: 1 },
          { symbol: 'ANET  171020P00180000', size: -1, price: 0.5 },
        ],
      },
    ],
    legs: [],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: 75,
    totalRealized: 150,
    totalBasis: -200,

    openPlPct: 0,
    unrealized: 0,
    openBasis: 0,

    netLiquidity: 0,
  });
});

test('closed winning debit spread', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 1,
        gross: -100,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 1, price: 2 },
          { symbol: 'ANET  171020P00180000', size: -1, price: 1 },
        ],
      },
      {
        price_each: 5,
        gross: 500,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -1, price: 7 },
          { symbol: 'ANET  171020P00180000', size: 1, price: 2 },
        ],
      },
    ],
    legs: [],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: 400,
    totalRealized: 400,
    totalBasis: 100,

    openPlPct: 0,
    unrealized: 0,
    openBasis: 0,

    netLiquidity: 0,
  });
});

test('closed losing debit spread', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 2,
        gross: -200,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 1, price: 6 },
          { symbol: 'ANET  171020P00180000', size: -1, price: 4 },
        ],
      },
      {
        price_each: 0.2,
        gross: 20,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -1, price: 0.3 },
          { symbol: 'ANET  171020P00180000', size: 1, price: 0.1 },
        ],
      },
    ],
    legs: [],
  };

  expect(positionInfo(pos, mockQuote)).toStrictEqual({
    underlyingPrice: mockQuote('ANET'),
    totalPlPct: -90,
    totalRealized: -180,
    totalBasis: 200,

    openPlPct: 0,
    unrealized: 0,
    openBasis: 0,

    netLiquidity: 0,
  });
});

test('open debit spread, add some, close some', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 1,
        gross: -100,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 1, price: 2 },
          { symbol: 'ANET  171020P00180000', size: -1, price: 1 },
        ],
      },
      {
        price_each: 2,
        gross: -400,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 2, price: 4 },
          { symbol: 'ANET  171020P00180000', size: -2, price: 2 },
        ],
      },
      {
        price_each: 5,
        gross: 500,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -1, price: 8 },
          { symbol: 'ANET  171020P00180000', size: 1, price: 3 },
        ],
      },
    ],
    legs: [
      { symbol: 'ANET  171020P00190000', size: 2 },
      { symbol: 'ANET  171020P00180000', size: -2 },
    ],
  };

  let totalBasis = 500;
  let netLiquidity = 150 * 2;
  let openBasis = (500 * 2) / 3;
  let unrealized = netLiquidity - openBasis;
  let realized = 500 - 500 / 3;
  let openPlPct = (unrealized / Math.abs(openBasis)) * 100;
  let totalPlPct = ((realized + unrealized) / totalBasis) * 100;

  let result = positionInfo(pos, mockQuote);

  expect(result.totalPlPct).toBeCloseTo(totalPlPct);
  expect(result.totalRealized).toBeCloseTo(realized);
  expect(result.totalBasis).toBeCloseTo(totalBasis);
  expect(result.openPlPct).toBeCloseTo(openPlPct);
  expect(result.unrealized).toBeCloseTo(unrealized);
  expect(result.openBasis).toBeCloseTo(openBasis);
  expect(result.netLiquidity).toBeCloseTo(netLiquidity);
  expect(result.underlyingPrice).toBe(mockQuote('ANET'));
});

test('open credit spread, add some, close some', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 1,
        gross: 100,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -1, price: 2 },
          { symbol: 'ANET  171020P00180000', size: 1, price: 1 },
        ],
      },
      {
        price_each: 2,
        gross: 400,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -2, price: 4 },
          { symbol: 'ANET  171020P00180000', size: 2, price: 2 },
        ],
      },
      {
        price_each: 5,
        gross: -500,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 1, price: 8 },
          { symbol: 'ANET  171020P00180000', size: -1, price: 3 },
        ],
      },
    ],
    legs: [
      { symbol: 'ANET  171020P00190000', size: -2 },
      { symbol: 'ANET  171020P00180000', size: 2 },
    ],
  };

  let totalBasis = -500;
  let netLiquidity = -150 * 2;
  let openBasis = (totalBasis * 2) / 3;
  let unrealized = netLiquidity - openBasis;
  let realized = totalBasis - totalBasis / 3;
  let openPlPct = (unrealized / Math.abs(openBasis)) * 100;
  let totalPlPct = ((realized + unrealized) / Math.abs(totalBasis)) * 100;

  let result = positionInfo(pos, mockQuote);

  expect(result.totalBasis).toBeCloseTo(totalBasis);
  expect(result.openBasis).toBeCloseTo(openBasis);
  expect(result.netLiquidity).toBeCloseTo(netLiquidity);
  expect(result.unrealized).toBeCloseTo(unrealized);
  expect(result.totalPlPct).toBeCloseTo(totalPlPct);
  expect(result.totalRealized).toBeCloseTo(realized);
  expect(result.openPlPct).toBeCloseTo(openPlPct);
  expect(result.underlyingPrice).toBe(mockQuote('ANET'));
});

test('open some credit spreads, close some, add some more, close some', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 1,
        gross: 500,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -5, price: 2 },
          { symbol: 'ANET  171020P00180000', size: 5, price: 1 },
        ],
      },

      {
        price_each: 0.5,
        gross: -100,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 2, price: 1 },
          { symbol: 'ANET  171020P00180000', size: -2, price: 0.5 },
        ],
      },
      {
        price_each: 2,
        gross: 400,
        legs: [
          { symbol: 'ANET  171020P00190000', size: -2, price: 4 },
          { symbol: 'ANET  171020P00180000', size: 2, price: 2 },
        ],
      },
      {
        price_each: 5,
        gross: -500,
        legs: [
          { symbol: 'ANET  171020P00190000', size: 1, price: 8 },
          { symbol: 'ANET  171020P00180000', size: -1, price: 3 },
        ],
      },
    ],
    legs: [
      { symbol: 'ANET  171020P00190000', size: -4 },
      { symbol: 'ANET  171020P00180000', size: 4 },
    ],
  };

  let totalBasis = -700;
  let netLiquidity = -150 * 4;
  let openBasis = (totalBasis * 4) / 5;
  let unrealized = netLiquidity - openBasis;
  let realized = 2 * 50 + (700 / 5 - 500);
  let openPlPct = (unrealized / Math.abs(openBasis)) * 100;
  let totalPlPct = ((realized + unrealized) / Math.abs(totalBasis)) * 100;

  let result = positionInfo(pos, mockQuote);

  expect(result.totalBasis).toBeCloseTo(totalBasis);
  expect(result.openBasis).toBeCloseTo(openBasis);
  expect(result.netLiquidity).toBeCloseTo(netLiquidity);
  expect(result.unrealized).toBeCloseTo(unrealized);
  expect(result.totalPlPct).toBeCloseTo(totalPlPct);
  expect(result.totalRealized).toBeCloseTo(realized);
  expect(result.openPlPct).toBeCloseTo(openPlPct);
  expect(result.underlyingPrice).toBe(mockQuote('ANET'));
});

test('rolling spreads with increasing cost basis', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 1,
        gross: 500,
        legs: [
          { symbol: 'ANET  171020P00140000', size: -5, price: 2 },
          { symbol: 'ANET  171020P00130000', size: 5, price: 1 },
        ],
      },

      {
        price_each: 0.5,
        gross: 250,
        legs: [
          { symbol: 'ANET  171020P00140000', size: 5, price: 3 },
          { symbol: 'ANET  171020P00130000', size: -5, price: 1.5 },
          { symbol: 'ANET  171020P00190000', size: -5, price: 4 },
          { symbol: 'ANET  171020P00180000', size: 5, price: 2 },
        ],
      },
    ],
    legs: [
      { symbol: 'ANET  171020P00190000', size: -5 },
      { symbol: 'ANET  171020P00180000', size: 5 },
    ],
  };

  let totalBasis = -1000;
  let netLiquidity = -150 * 5;
  let openBasis = -1000;
  let unrealized = netLiquidity - openBasis;
  let realized = -250;
  let openPlPct = (unrealized / Math.abs(openBasis)) * 100;
  let totalPlPct = ((realized + unrealized) / Math.abs(totalBasis)) * 100;

  let result = positionInfo(pos, mockQuote);

  expect(result.totalBasis).toBeCloseTo(totalBasis);
  expect(result.openBasis).toBeCloseTo(openBasis);
  expect(result.netLiquidity).toBeCloseTo(netLiquidity);
  expect(result.unrealized).toBeCloseTo(unrealized);
  expect(result.totalPlPct).toBeCloseTo(totalPlPct);
  expect(result.totalRealized).toBeCloseTo(realized);
  expect(result.openPlPct).toBeCloseTo(openPlPct);
  expect(result.underlyingPrice).toBe(mockQuote('ANET'));
});

test('rolling spreads with decreasing cost basis', function() {
  let pos: Position<Trade> = {
    symbol: 'ANET',
    trades: [
      {
        price_each: 1,
        gross: 500,
        legs: [
          { symbol: 'ANET  171020P00140000', size: -5, price: 2 },
          { symbol: 'ANET  171020P00130000', size: 5, price: 1 },
        ],
      },

      {
        price_each: 0.5,
        gross: 250,
        legs: [
          { symbol: 'ANET  171020P00140000', size: 5, price: 3 },
          { symbol: 'ANET  171020P00130000', size: -5, price: 2.5 },
          { symbol: 'ANET  171020P00190000', size: -5, price: 4 },
          { symbol: 'ANET  171020P00180000', size: 5, price: 3.75 },
        ],
      },
    ],
    legs: [
      { symbol: 'ANET  171020P00190000', size: -5 },
      { symbol: 'ANET  171020P00180000', size: 5 },
    ],
  };

  let totalBasis = -500;
  let netLiquidity = -150 * 5;
  let openBasis = -125;
  let unrealized = netLiquidity - openBasis;
  let realized = 250;
  let openPlPct = (unrealized / Math.abs(openBasis)) * 100;
  let totalPlPct = ((realized + unrealized) / Math.abs(totalBasis)) * 100;

  let result = positionInfo(pos, mockQuote);

  expect(result.totalBasis).toBeCloseTo(totalBasis);
  expect(result.openBasis).toBeCloseTo(openBasis);
  expect(result.netLiquidity).toBeCloseTo(netLiquidity);
  expect(result.unrealized).toBeCloseTo(unrealized);
  expect(result.totalPlPct).toBeCloseTo(totalPlPct);
  expect(result.totalRealized).toBeCloseTo(realized);
  expect(result.openPlPct).toBeCloseTo(openPlPct);
  expect(result.underlyingPrice).toBe(mockQuote('ANET'));
});
