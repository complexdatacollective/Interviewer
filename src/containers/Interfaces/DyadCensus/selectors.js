/* eslint-disable import/prefer-default-export */

import { entityPrimaryKeyProperty } from '../../../ducks/modules/network';

// mutally exclusive only
export const getPairs = (nodes) => {
  const nodeIds = nodes.map(node => node[entityPrimaryKeyProperty]);

  const pairs = nodeIds.reduce(
    ({ result, pool }, id) => {
      const nextPool = pool.filter(alterId => alterId !== id);

      if (nextPool.length === 0) {
        return result;
      }

      const newPairs = nextPool.map(alterId => ([id, alterId]));

      return {
        result: [...result, ...newPairs],
        pool: nextPool,
      };
    },
    { pool: nodeIds, result: [] },
  );

  return pairs;
};
