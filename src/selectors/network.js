import { createSelector } from 'reselect'
import { difference, nodeIncludesAttributes } from '../utils/Network';
import { activeNodeAttributes, activeStageAttributes } from './session';

const network = state => state.network;

// Filter the network according to current stage AND prompt
export const activeStageNetwork = createSelector(
  network,
  activeStageAttributes,
  (network, activeStageAttributes) => {
    return nodeIncludesAttributes(network, activeStageAttributes);
  }
)

// Filter the network according to current stage AND prompt
export const activePromptNetwork = createSelector(
  network,
  activeNodeAttributes,
  (network, activeNodeAttributes) => {
    return nodeIncludesAttributes(network, activeNodeAttributes);
  }
)

// Filter the network:
// - Node is not from current stage
// - Node is the same type as current stage
export const restOfNetwork = createSelector(
  network,
  activeStageAttributes,
  (network, activeStageAttributes) => {
    return nodeIncludesAttributes(difference(network, nodeIncludesAttributes(network, { stageId: activeStageAttributes.stageId })), { type: activeStageAttributes.type });
  }
)
