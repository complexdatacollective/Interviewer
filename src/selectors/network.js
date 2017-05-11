import { createSelector } from 'reselect'
import { difference, nodeIncludesAttributes } from '../utils/Network';
import { activePromptAttributes, activeStageAttributes, activeOriginAttributes } from './session';

const network = state => state.network;

// Filter the network according to current stage
export const activeStageNetwork = createSelector(
  network,
  activeStageAttributes,
  (network, activeStageAttributes) => {
    return nodeIncludesAttributes(network, activeStageAttributes);
  }
)

// Filter the network according to current prompt (AND stage)
export const activePromptNetwork = createSelector(
  network,
  activeStageAttributes,
  activePromptAttributes,
  (network, activeStageAttributes, activeNodeAttributes) => {
    return nodeIncludesAttributes(network, { ...activeStageAttributes, ...activeNodeAttributes });
  }
)

// Filter the network according to current promptId (AND stageId)
export const activeOriginNetwork = createSelector(
  network,
  activeOriginAttributes,
  (network, activeOriginAttributes) => {
    return nodeIncludesAttributes(network, activeOriginAttributes);
  }
)

// Filter the network:
// - Node is not from origin
// - Node is the same type as current stage
export const restOfNetwork = createSelector(
  network,
  activeOriginNetwork,
  activeStageAttributes,
  (network, activeOriginNetwork, activeStageAttributes) => {
    return nodeIncludesAttributes(difference(network, activeOriginNetwork), { type: activeStageAttributes.type });
  }
)
