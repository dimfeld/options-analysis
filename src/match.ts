import * as _ from 'lodash';
import { OptionLeg } from './types';

export interface HasOptionLegs {
  legs : OptionLeg[];
}

export interface MatchingPositionScore<T> {
  score: number;
  overlapping : number;
  position: T;
}

export function match_positions<T extends HasOptionLegs>(trade : HasOptionLegs, positions: T[]) : Array<MatchingPositionScore<T>> {

  let legs = trade.legs;

  return _.chain(positions)
    .map((position) => {
      let overlapping = _.reduce(legs, (acc, leg) => {
        let found_leg = _.find(position.legs, (p_leg) => p_leg.symbol === leg.symbol);
        if(found_leg) {
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
    .filter((x) => x.score > 0)
    .orderBy((x) => x.score,  'desc')
    .value();
}
