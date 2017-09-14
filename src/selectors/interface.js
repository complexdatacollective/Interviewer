/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { filter, reject } from 'lodash';

/*
These selectors assume the following props:
stage: which contains the protocol config for the stage
prompt: which contains the protocol config for the prompt
*/

const propStageId = (_, props) => props.stage.id;
const propPromptId = (_, props) => props.prompt.id;
export const propStageNodeType = (_, props) => props.stage.params.nodeType;

export const protocolData = state => state.protocol.config.data;
export const networkNodes = state => state.network.nodes;

export const propPromptIds = createSelector(
  [propStageId, propPromptId],
  (stageId, promptId) => ({ stageId, promptId }),
);

export const networkNodesOfStageType = createSelector(
  [networkNodes, propStageNodeType],
  (nodes, nodeType) => filter(nodes, ['type', nodeType]),
);

export const networkNodesForPrompt = createSelector(
  [networkNodes, propPromptIds],
  (nodes, attributes) => filter(nodes, attributes),
);

export const otherNetworkNodesWithStageNodeType = createSelector(
  [networkNodesOfStageType, propPromptIds],
  (nodes, promptAttributes) => reject(nodes, promptAttributes),
);
