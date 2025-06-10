import { findKey, find, get } from 'lodash';
import {
  getActiveSession,
  getStageSubjectType,
} from './session';
import { createDeepEqualSelector } from './utils';
import { getProtocolCodebook } from './protocol';
import { asWorkerAgentNetwork } from '../utils/networkFormat';
import { getEntityAttributes } from '../ducks/modules/network';
import customFilter from '../utils/networkQuery/filter';

export const getNetwork = createDeepEqualSelector(
  (state, props) => getActiveSession(state, props),
  (session) => (session && session.network) || { nodes: [], edges: [], ego: {} },
);

// Filtered network
export const getFilteredNetwork = createDeepEqualSelector(
  getNetwork,
  (_, props) => props && props.stage && props.stage.filter,
  (network, nodeFilter) => {
    if (nodeFilter && typeof nodeFilter !== 'function') {
      const filterFunction = customFilter(nodeFilter);
      return filterFunction(network);
    }
    return network;
  },
);

export const getNetworkNodes = createDeepEqualSelector(
  getFilteredNetwork,
  (network) => network.nodes,
);

export const getNetworkEgo = createDeepEqualSelector(
  getFilteredNetwork,
  (network) => network.ego,
);

export const getNetworkEdges = createDeepEqualSelector(
  getFilteredNetwork,
  (network) => network.edges,
);

export const getWorkerNetwork = createDeepEqualSelector(
  getNetwork,
  (state, props) => getProtocolCodebook(state, props),
  (network, registry) => asWorkerAgentNetwork(network, registry),
);

// The user-defined name of a node type; e.g. `codebook.node[uuid].name == 'person'`
export const makeGetNodeTypeDefinition = () => createDeepEqualSelector(
  (state, props) => getProtocolCodebook(state, props),
  (state, props) => get(props, 'type') // When used in <Node /> // TODO: should use makeGetSubject
      || get(props, 'stage.subject.type') // Standard location
      || get(state, 'type'), // Unknown - perhaps worker?
  (codebook, nodeType) => {
    const nodeDefinitions = codebook && codebook.node;
    return nodeDefinitions && nodeDefinitions[nodeType];
  },
);

// See: https://github.com/complexdatacollective/Network-Canvas/wiki/Node-Labeling
export const labelLogic = (codebookForNodeType, nodeAttributes) => {
  // 1. In the codebook for the stage's subject, look for a variable with a name
  // property of "name", and try to retrieve this value by key in the node's
  // attributes
  const variableCalledName = codebookForNodeType
    && codebookForNodeType.variables
    // Ignore case when looking for 'name'
    && findKey(
      codebookForNodeType.variables,
      (variable) => variable.name.toLowerCase() === 'name',
    );

  if (variableCalledName && nodeAttributes[variableCalledName]) {
    return nodeAttributes[variableCalledName];
  }

  // 2. Look for a property on the node with a key of ‘name’, and try to retrieve this
  // value as a key in the node's attributes.
  // const nodeVariableCalledName = get(nodeAttributes, 'name');

  const nodeVariableCalledName = find(
    nodeAttributes,
    (_, key) => key.toLowerCase() === 'name',
  );

  if (nodeVariableCalledName) {
    return nodeVariableCalledName;
  }

  // 3. Last resort!
  return "No 'name' variable!";
};

// Gets the node label variable and returns its value, or "No label".
// See: https://github.com/complexdatacollective/Network-Canvas/wiki/Node-Labeling
export const makeGetNodeLabel = () => createDeepEqualSelector(
  (state, props) => {
    const getNodeTypeDefinition = makeGetNodeTypeDefinition(state, props);
    return getNodeTypeDefinition(state, props);
  },
  (nodeTypeDefinition) => (node) => labelLogic(nodeTypeDefinition, getEntityAttributes(node)),
);

// Pure state selector variant of makeGetNodeLabel
export const getNodeLabel = (state, nodeType) => {
  const codebook = getProtocolCodebook(state);
  const nodeTypeDefinition = get(codebook, ['node', nodeType]);
  return (nodeAttributes) => labelLogic(nodeTypeDefinition, nodeAttributes);
};

export const makeGetNodeColor = () => createDeepEqualSelector(
  getProtocolCodebook,
  (_, props) => props.type,
  (codebook, nodeType) => {
    const nodeDefinitions = codebook.node;
    const nodeColor = get(
      nodeDefinitions,
      [nodeType, 'color'],
      'node-color-seq-1',
    );
    return nodeColor;
  },
);

// Pure state selector variant of makeGetNodeColor
export const getNodeColor = (nodeType) => (state) => {
  const codebook = getProtocolCodebook(state);
  const nodeDefinitions = codebook.node;
  const nodeColor = get(
    nodeDefinitions,
    [nodeType, 'color'],
    'node-color-seq-1',
  );
  return nodeColor;
};

export const getNodeTypeLabel = (nodeType) => (state) => {
  const codebook = getProtocolCodebook(state);
  const nodeDefinitions = codebook.node;
  const nodeLabel = get(nodeDefinitions, [nodeType, 'name'], '');
  return nodeLabel;
};

export const makeGetEdgeLabel = () => createDeepEqualSelector(
  getProtocolCodebook,
  (_, props) => props.type,
  (codebook, edgeType) => {
    const edgeInfo = codebook.edge;
    const edgeLabel = get(edgeInfo, [edgeType, 'name'], '');
    return edgeLabel;
  },
);

export const makeGetEdgeColor = () => createDeepEqualSelector(
  getProtocolCodebook,
  (_, props) => props.type,
  (codebook, edgeType) => {
    const edgeInfo = codebook.edge;
    const edgeColor = get(edgeInfo, [edgeType, 'color'], 'edge-color-seq-1');
    return edgeColor;
  },
);

export const makeGetNodeAttributeLabel = () => createDeepEqualSelector(
  getProtocolCodebook,
  getStageSubjectType(),
  (_, props) => props.variableId,
  (codebook, subjectType, variableId) => {
    const nodeDefinitions = codebook.node;
    const variables = get(nodeDefinitions, [subjectType, 'variables'], {});
    const attributeLabel = get(variables, [variableId, 'name'], variableId);
    return attributeLabel;
  },
);

export const getCategoricalOptions = createDeepEqualSelector(
  (state, props) => getProtocolCodebook(state, props),
  getStageSubjectType(),
  (_, props) => props.variableId,
  (codebook, subjectType, variableId) => {
    const nodeDefinitions = codebook.node;
    const variables = get(nodeDefinitions, [subjectType, 'variables'], {});
    const options = get(variables, [variableId, 'options'], []);
    return options;
  },
);

export const makeGetCategoricalOptions = () => getCategoricalOptions;
