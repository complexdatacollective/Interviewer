import { createSelector } from 'reselect';
import { filter } from 'lodash';
import { activePrompt, activeStageAttributes } from './session';

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

// Filter the nodes according to current prompt layout (AND stage)
export const getPlacedNodes = createSelector(
  nodesOfStageType,
  activePrompt,
  (nodes, prompt) => {
    const nodeHasLayout = node => Object.prototype.hasOwnProperty.call(node, prompt.layout);

    return filter(nodes, nodeHasLayout);
  },
);

// Filter the network:
// - Node is not from this layout prompt
// - Node is the same type as current stage
export const getUnplacedNodes = createSelector(
  nodesOfStageType,
  activePrompt,
  (nodes, prompt) => {
    const nodeWithoutLayout = node => !Object.prototype.hasOwnProperty.call(node, prompt.layout);

    return filter(nodes, nodeWithoutLayout);
  },
);
