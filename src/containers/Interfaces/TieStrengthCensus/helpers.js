import { entityPrimaryKeyProperty } from '@codaco/shared-consts';

/**
 * Given a list of nodes calculate all unique possible pairs,
 * not accounting for directionality
 *
 * @param {array} nodes - An array of node objects
 * @returns {array} An array of node pairs e.g. `[[id, id], ...]`
 */
export const getPairs = (nodes) => {
  const nodeIds = nodes.map((node) => node[entityPrimaryKeyProperty]);

  const pairs = nodeIds.reduce(
    ({ result, pool }, id) => {
      const nextPool = pool.filter((alterId) => alterId !== id);

      if (nextPool.length === 0) {
        return result;
      }

      const newPairs = nextPool.map((alterId) => ([id, alterId]));

      return {
        result: [...result, ...newPairs],
        pool: nextPool,
      };
    },
    { pool: nodeIds, result: [] },
  );

  return pairs;
};

export const getNode = (nodes, id) => nodes.find((node) => node[entityPrimaryKeyProperty] === id);

export const getNodePair = (nodes, pair) => {
  if (!pair) { return []; }
  return pair.map((id) => getNode(nodes, id));
};
