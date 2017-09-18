/* eslint-disable import/prefer-default-export */

import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import { filter, reject, isEqual } from 'lodash';

// create a "selector creator" that uses lodash.isEqual instead of ===
const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
);

/*
These selectors assume the following props:
  stage: which contains the protocol config for the stage
  prompt: which contains the protocol config for the prompt
*/

// Prop selectors

const propStageId = (_, props) => props.stage.id;
const propPromptId = (_, props) => props.prompt.id;
const propPromptNodeAttributes = (_, props) => props.prompt.nodeAttributes;
export const propStageNodeType = (_, props) => props.stage.params.nodeType;

// State selectors

export const protocolData = state => state.protocol.config.data;

// MemoedSelectors

export const networkNodes = createDeepEqualSelector(
    state => state.network.nodes,
    nodes => nodes,
  );

export const propPromptIds = createSelector(
  [propStageId, propPromptId],
  (stageId, promptId) => ({ stageId, promptId }),
);

export const networkNodesOfStageType = createSelector(
    [networkNodes, propStageNodeType],
    (nodes, nodeType) => filter(nodes, ['type', nodeType]),
  );

export const makeNewNodeAttributes = () =>
  createSelector(
    [propStageNodeType, propStageId, propPromptId, propPromptNodeAttributes],
    (type, stageId, promptId, nodeAttributes) => ({
      type,
      stageId,
      promptId,
      ...nodeAttributes,
    }),
  );

export const makeNetworkNodesForPrompt = () =>
  createSelector(
    [networkNodes, propPromptIds],
    (nodes, attributes) => filter(nodes, attributes),
  );

export const otherNetworkNodesWithStageNodeType = createSelector(
    [networkNodesOfStageType, propPromptIds],
    (nodes, promptAttributes) => reject(nodes, promptAttributes),
  );
