/* eslint-env jest */

import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { getPairs } from '../helpers';

describe('getPairs()', () => {
  it('given a list of nodes it generates a list of all non-directional (e.g. unique) pairs', () => {
    const nodes = [
      { [entityPrimaryKeyProperty]: 1 },
      { [entityPrimaryKeyProperty]: 2 },
      { [entityPrimaryKeyProperty]: 3 },
      { [entityPrimaryKeyProperty]: 4 },
    ];

    const result = getPairs(nodes);

    expect(result).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4],
    ]);
  });
});
