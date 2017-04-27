import { createSelector } from 'reselect'
import { diff, nodeIncludesAttributes } from '../utils/Network';
import { activeNodeAttributes, activeStageAttributes } from './session';

const network = state => state.network;

export const activeNetwork = createSelector(
  network,
  activeNodeAttributes,
  (network, activeNodeAttributes) => {
    return nodeIncludesAttributes(network, activeNodeAttributes);
  }
)

export const existingNetwork = createSelector(
  network,
  activeStageAttributes,
  (network, activeStageAttributes) => {
    return nodeIncludesAttributes(diff(network, nodeIncludesAttributes(network, { stageId: activeStageAttributes.stageId })), { type: activeStageAttributes.type });
  }
)
