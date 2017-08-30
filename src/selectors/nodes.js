import { createSelector } from 'reselect';
import { filter } from 'lodash';
import { activeStageAttributes } from './session';

const allNodes = state => state.network.nodes;

export const nodesOfStageType = createSelector(
  allNodes,
  activeStageAttributes,
  (nodes, stageAttributes) =>
    filter(
      nodes,
      ['type', stageAttributes.type],
    ),
);

// Filter the nodes according to layout (AND stage)
export const getPlacedNodes = layout => createSelector(
  nodesOfStageType,
  (nodes) => {
    const nodeHasLayout = node => Object.prototype.hasOwnProperty.call(node, layout);

    return filter(nodes, nodeHasLayout);
  },
);

// Filter the network:
// - Node is not from this layout prompt
// - Node is the same type as current stage
export const getUnplacedNodes = layout => createSelector(
  nodesOfStageType,
  (nodes) => {
    const nodeWithoutLayout = node => !Object.prototype.hasOwnProperty.call(node, layout);

    return filter(nodes, nodeWithoutLayout);
  },
);
