import orderBy from 'lodash/orderBy';
import { OptionLeg } from './types';

export interface HasOptionLegs {
  legs: OptionLeg[];
}

export interface MatchingPositionScore<T> {
  score: number;
  overlapping: number;
  position: T;
}

export function matchPositions<T extends HasOptionLegs>(
  trade: HasOptionLegs,
  positions: T[]
): Array<MatchingPositionScore<T>> {
  let legs = trade.legs;

  let matched = positions
    .map((position) => {
      let overlapping = legs.reduce((acc, leg) => {
        let found_leg = position.legs.find(
          (p_leg) => p_leg.symbol === leg.symbol
        );
        if (found_leg) {
          acc += 1;
        }
        return acc;
      }, 0);

      return {
        score: overlapping / position.legs.length,
        overlapping,
        position,
      };
    })
    .filter((x) => x.score > 0);

  return orderBy(matched, (x) => x.score, 'desc');
}
