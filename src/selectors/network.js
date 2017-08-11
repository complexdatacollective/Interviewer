/* eslint-disable */ // no-shadow */
import { createSelector } from 'reselect';
import { filter } from 'lodash';
import { difference, nodeIncludesAttributes } from '../utils/Network';
import { activePromptAttributes, activePromptLayout, activeStageAttributes, activeOriginAttributes } from './session';

const network = state => state.network;
const nodes = state => state.network.nodes;

// Filter the network according to current stage
export const activeStageNetwork = createSelector(
  network,
  activeStageAttributes,
  (network, activeStageAttributes) =>
    nodeIncludesAttributes(network, activeStageAttributes),
);

// Filter the network according to current prompt (AND stage)
export const activePromptNetwork = createSelector(
  network,
  activeStageAttributes,
  activePromptAttributes,
  (network, activeStageAttributes, activeNodeAttributes) =>
    nodeIncludesAttributes(
      network,
      { ...activeStageAttributes, ...activeNodeAttributes },
    ),
);

// Filter the network according to current prompt layout (AND stage)
export const activeLayoutNetwork = createSelector(
  network,
  activeStageAttributes,
  activePromptLayout,
  (network, activeStageAttributes, activePromptLayout) =>
    nodeIncludesAttributes(
      network,
      { ...activeStageAttributes, activePromptLayout },
    ),
);

// Filter the network according to current promptId (AND stageId)
export const activeOriginNetwork = createSelector(
  network,
  activeOriginAttributes,
  (network, activeOriginAttributes) =>
    nodeIncludesAttributes(network, activeOriginAttributes),
);

// Filter the network:
// - Node is not from this layout prompt
// - Node is the same type as current stage
export const unplacedNodes = createSelector(
  nodes,
  activePromptLayout,
  activeStageAttributes,
  (nodes, activePromptLayout, activeStageAttributes) => {
    const nodeHasLayout = (node) => (
      !(
        Object.prototype.hasOwnProperty.call(node, 'layouts') &&
        Object.prototype.hasOwnProperty.call(node.layouts, activePromptLayout)
      )
    );

    return filter(
      filter(nodes, nodeHasLayout),
      ['type', activeStageAttributes.type],
    );
  }
);

// Filter the network:
// - Node is not from origin
// - Node is the same type as current stage
export const restOfNetwork = createSelector(
  network,
  activeOriginNetwork,
  activeStageAttributes,
  (network, activeOriginNetwork, activeStageAttributes) =>
    nodeIncludesAttributes(
      difference(network, activeOriginNetwork),
      { type: activeStageAttributes.type },
    ),
);
