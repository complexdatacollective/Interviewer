/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { findKey, filter, has, reject } from 'lodash';
import { createDeepEqualSelector } from './utils';
import { protocolRegistry } from './protocol';
import { getCurrentSession } from './session';

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
export const getNetwork = createDeepEqualSelector(
  getCurrentSession,
  session => (session && session.network) || { nodes: [], edges: [] },
);

export const networkNodes = createDeepEqualSelector(
  getNetwork,
  network => network.nodes,
);

export const networkEdges = createDeepEqualSelector(
  getNetwork,
  network => network.edges,
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

export const makeGetNodeType = () => (createSelector(
  makeGetSubject(),
  subject => subject && subject.type,
));

export const makeGetDisplayVariable = () => createDeepEqualSelector(
  protocolRegistry,
  makeGetNodeType(),
  (variableRegistry, nodeType) => {
    const nodeInfo = variableRegistry && variableRegistry.node;
    return nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].displayVariable;
  },
);

export const makeGetNodeVariables = () => createDeepEqualSelector(
  protocolRegistry,
  makeGetNodeType(),
  (variableRegistry, nodeType) => {
    const nodeInfo = variableRegistry && variableRegistry.node;
    return nodeInfo && nodeInfo[nodeType].variables;
  },
);

export const makeGetPromptVariable = () =>
  createSelector(
    propPrompt,
    prompt => prompt.variable,
  );

export const makeGetOrdinalValues = () =>
  createSelector(
    makeGetNodeVariables(), makeGetPromptVariable(),
    (nodeVariables, promptVariable) => {
      const ordinalValues = nodeVariables[promptVariable].values;
      return ordinalValues;
    },
  );

export const getNodeLabelFunction = createDeepEqualSelector(
  protocolRegistry,
  variableRegistry => (node) => {
    const nodeInfo = variableRegistry && variableRegistry.node;
    const displayVariable = nodeInfo && node && node.type && nodeInfo[node.type] &&
      nodeInfo[node.type].displayVariable;
    const firstTextVariable = nodeInfo && node && node.type && nodeInfo[node.type] &&
      nodeInfo[node.type].variables && findKey(nodeInfo[node.type].variables, ['type', 'text']);
    return node.label ||
      (displayVariable && node[displayVariable]) ||
      (firstTextVariable && node[firstTextVariable]) ||
      String(node.id);
  },
);

export const makeNetworkNodesForSubject = () => {
  const getSubject = makeGetSubject();

  return createSelector(
    networkNodes, getSubject,
    (nodes, subject) => filter(nodes, ['type', subject.type]),
  );
};

export const makeNetworkNodesForPrompt = () => {
  // used to check prompt ids
  const getAttributes = makeGetAdditionalAttributes();

  return createSelector(
    networkNodes, getAttributes,
    (nodes, attributes) => filter(nodes, attributes),
  );
};

export const makeNetworkNodesForOtherPrompts = () => {
  // used to check prompt ids
  const getAttributes = makeGetAdditionalAttributes();
  const networkNodesForSubject = makeNetworkNodesForSubject();

  return createSelector(
    networkNodesForSubject, getAttributes,
    (nodes, attributes) =>
      reject(
        nodes,
        attributes,
      ),
  );
};
