/* tslint:disable no-implicit-dependencies */
import { assert } from 'chai';
import { matchPositions } from './match';

describe('matchPositions', function() {
  it('matches', function() {
    let positions = [
      {
        legs: [
          { symbol: 'a', size: 5 },
          { symbol: 'c', size: -3 },
        ],
      },
      {
        legs: [
          { symbol: 'a', size: 5 },
          { symbol: 'b', size: -3 },
        ],
      },
      {
        legs: [
          { symbol: 'd', size: 5 },
          { symbol: 'f', size: -3 },
        ],
      },
    ];

    let trade = {
      legs: [
        { symbol: 'a', size: -5 },
        { symbol: 'b', size: 3 },
      ],
    };

    let results = matchPositions(trade, positions);

    let expected = [
      { score: 1, overlapping: 2, position: positions[1] },
      { score: 0.5, overlapping: 1, position: positions[0] },
    ]
    assert.deepEqual(results, expected);
  });
});
