/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { findKey, filter, has, isMatch, reject } from 'lodash';
import { assert, createDeepEqualSelector } from './utils';
import { protocolRegistry } from './protocol';
import { getCurrentSession } from './session';
import { getNodeAttributes, nodeAttributesProperty, asWorkerAgentNode } from '../ducks/modules/network';

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

export const getWorkerNetwork = createDeepEqualSelector(
  networkNodes, networkEdges,
  (nodes = [], edges = []) => ({
    nodes: nodes.map(asWorkerAgentNode),
    edges,
  }),
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

const nodeTypeIsDefined = (variableRegistry, nodeType) =>
  variableRegistry.node &&
  !!variableRegistry.node[nodeType];

export const makeGetNodeType = () => (createSelector(
  protocolRegistry,
  makeGetSubject(),
  (variableRegistry, subject) => {
    assert(subject, 'The "subject" property is not defined for this prompt');
    assert(nodeTypeIsDefined(variableRegistry, subject.type), `Node type "${subject.type}" is not defined in the registry`);
    return subject && subject.type;
  },
));

export const makeGetNodeDisplayVariable = () => createDeepEqualSelector(
  protocolRegistry,
  makeGetNodeType(),
  (variableRegistry, nodeType) => {
    const nodeInfo = variableRegistry.node;
    return nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].displayVariable;
  },
);

export const makeGetNodeVariables = () => createDeepEqualSelector(
  protocolRegistry,
  makeGetNodeType(),
  (variableRegistry, nodeType) => {
    const nodeInfo = variableRegistry.node;
    return nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].variables;
  },
);

export const makeGetPromptVariable = () =>
  createSelector(
    propPrompt,
    prompt => prompt.variable,
  );

export const makeGetVariableOptions = () =>
  createSelector(
    makeGetNodeVariables(), makeGetPromptVariable(),
    (nodeVariables, promptVariable) => {
      const optionValues = nodeVariables[promptVariable].options;
      return optionValues;
    },
  );

export const getNodeLabelFunction = createDeepEqualSelector(
  protocolRegistry,
  variableRegistry => (node) => {
    const nodeInfo = variableRegistry.node;

    // Get the display variable by looking up the node type in the variable registry
    const displayVariable = nodeInfo && node && node.type && nodeInfo[node.type] &&
      nodeInfo[node.type].displayVariable;

    // For fallback: get the first variable of type 'text'
    const firstTextVariable = nodeInfo && node && node.type && nodeInfo[node.type] &&
      nodeInfo[node.type].variables && findKey(nodeInfo[node.type].variables, ['type', 'text']);

    // Get the data model properties from the node
    const nodeDataModelProps = getNodeAttributes(node);
    // Try to return the label prop
    // else try to use the displayVariable
    // else try to use the first text variable
    // else return the string "No label"
    return nodeDataModelProps.label ||
      (displayVariable && nodeDataModelProps[displayVariable]) ||
      (firstTextVariable && nodeDataModelProps[firstTextVariable]) ||
      'No label';
  },
);

/**
 * makeNetworkNodesForType()
 * Get the current prompt/stage subject, and filter the network by this node type.
*/

export const makeNetworkNodesForType = () => {
  const getSubject = makeGetSubject();
  return createSelector(
    networkNodes, getSubject,
    (nodes, subject) => filter(nodes, ['type', subject.type]),
  );
};

/**
 * makeNetworkNodesForPrompt
 * Take the "additional attributes" specified by the current prompt, and filter nodes of the current
 * prompt type
*/

export const makeNetworkNodesForPrompt = () => {
  const getAttributes = makeGetAdditionalAttributes();
  const networkNodesForSubject = makeNetworkNodesForType();

  return createSelector(
    networkNodesForSubject, getAttributes,
    (nodes, attributes) =>
      filter(nodes, { [nodeAttributesProperty]: attributes }),
  );
};

/**
 * makeNetworkNodesForOtherPrompts()
 * Same as above, except returns a filtered node list that **excludes** nodes that match.
*/

export const makeNetworkNodesForOtherPrompts = () => {
  // used to check prompt ids
  const getAttributes = makeGetAdditionalAttributes();
  const networkNodesForSubject = makeNetworkNodesForType();

  return createSelector(
    networkNodesForSubject, getAttributes,
    (nodes, attributes) =>
      reject(nodes, node => isMatch(getNodeAttributes(node), attributes)),
  );
};
