/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { filter, has, reject } from 'lodash';
import { createDeepEqualSelector } from './utils';

// Selectors that are generic between interfaces

/*
These selectors assume the following props:
  stage: which contains the protocol config for the stage
  prompt: which contains the protocol config for the prompt
*/

// Prop selectors

const propStage = (_, props) => props.stage;
const propPrompt = (_, props) => props.prompt;
const propStageId = (_, props) => props.stage.id;
const propPromptId = (_, props) => props.prompt.id;

// State selectors

// MemoedSelectors

export const networkNodes = createDeepEqualSelector(
  state => state.network.nodes,
  nodes => nodes,
);

export const networkEdges = createDeepEqualSelector(
  state => state.network.edges,
  nodes => nodes,
);

export const makeGetIds = () =>
  createSelector(
    propStageId, propPromptId,
    (stageId, promptId) => ({ stageId, promptId }),
  );

export const makeGetAdditionalAttributes = () =>
  createSelector(
    propStage, propPrompt,
    (stage, prompt) => {
      const stageAttributes = (has(stage, 'additionalAttributes') ? stage.additionalAttributes : {});
      const promptAttributes = (has(prompt, 'additionalAttributes') ? prompt.additionalAttributes : {});

      return {
        ...stageAttributes,
        ...promptAttributes,
      };
    },
  );

export const makeGetSubject = () =>
  createSelector(
    propStage, propPrompt,
    (stage, prompt) => {
      if (has(stage, 'subject')) { return stage.subject; }
      return prompt.subject;
    },
  );

export const makeNetworkNodesForSubject = () => {
  const getSubject = makeGetSubject();
  createSelector(
    networkNodes, getSubject,
    (nodes, subject) => filter(nodes, ['type', subject.type]),
  );
};

export const makeNetworkNodesForPrompt = () => {
  // used to check node attributes
  const getIds = makeGetIds();

  return createSelector(
    networkNodes, getIds,
    (nodes, attributes) => filter(nodes, attributes),
  );
};

export const makeNetworkNodesForOtherPrompts = () => {
  // used to check node attributes
  const getIds = makeGetIds();

  return createSelector(
    networkNodes, getIds,
    (nodes, { stageId, promptId }) =>
      reject(
        filter(nodes, { stageId }),
        { promptId },
      ),
  );
};
