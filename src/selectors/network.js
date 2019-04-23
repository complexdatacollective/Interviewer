import { findKey } from 'lodash';
import { getActiveSession, getCaseId } from './session';
import { createDeepEqualSelector } from './utils';
import { getProtocolCodebook } from './protocol';
import { asExportableNetwork, asWorkerAgentNetwork } from '../utils/networkFormat';
import { getEntityAttributes } from '../ducks/modules/network';

export const getNetwork = createDeepEqualSelector(
  (state, props) => getActiveSession(state, props),
  session => (session && session.network) || { nodes: [], edges: [] },
);

export const getNetworkNodes = createDeepEqualSelector(
  getNetwork,
  network => network.nodes,
);

export const getNetworkEgo = createDeepEqualSelector(
  getNetwork,
  network => network.ego,
);

export const getNetworkEdges = createDeepEqualSelector(
  getNetwork,
  network => network.edges,
);

export const getExportableNetwork = createDeepEqualSelector(
  getNetwork,
  (state, props) => getProtocolCodebook(state, props),
  (state, props) => getCaseId(state, props),
  (network, registry, _caseID) => asExportableNetwork(network, registry, { _caseID }),
);

export const getWorkerNetwork = createDeepEqualSelector(
  getNetwork,
  (state, props) => getProtocolCodebook(state, props),
  (network, registry) => asWorkerAgentNetwork(network, registry),
);

// The user-defined name of a node type; e.g. `codebook.node[uuid].name == 'person'`
export const makeGetNodeTypeDefinition = () => createDeepEqualSelector(
  (state, props) => getProtocolCodebook(state, props),
  (state, props) =>
    (props && props.type) ||
    (props && props.stage && props.stage.subject && props.stage.subject.type) ||
    (state && state.type),
  (codebook, nodeType) => {
    const nodeInfo = codebook && codebook.node;
    return nodeInfo && nodeInfo[nodeType];
  },
);

// See: https://github.com/codaco/Network-Canvas/wiki/Node-Labeling
const labelLogic = (codebookForNodeType, nodeAttributes) => {
  // In the codebook for the stage's subject, look for the displayVariable property
  // and try to retrieve this value as a key in the node's attributes.
  const displayVariable = codebookForNodeType && codebookForNodeType.displayVariable;
  if (displayVariable && nodeAttributes[displayVariable]) {
    return nodeAttributes[displayVariable];
  }

  // In the codebook for the stage's subject, look for a variable with a name
  // property of "name", and try to retrieve this value by key in the node's
  // attributes
  const variableCalledName = codebookForNodeType && codebookForNodeType.variables && findKey(codebookForNodeType.variables, ['name', 'name']);
  if (variableCalledName && nodeAttributes[variableCalledName]) {
    return nodeAttributes[variableCalledName];
  }

  // look for a property on the node with a key of ‘displayVariable’, and try to
  // retrieve this value as a key in the node's attributes.
  const nodeDisplayVariable = nodeAttributes.displayVariable;
  if (nodeDisplayVariable && nodeAttributes[nodeDisplayVariable]) {
    return nodeAttributes[nodeDisplayVariable];
  }

  // look for a property on the node with a key of ‘name’, and try to retrieve this
  // value as a key in the node's attributes.
  const nodeVariableCalledName = findKey(nodeAttributes, ['name', 'name']);
  if (nodeVariableCalledName) {
    return nodeAttributes[nodeVariableCalledName];
  }

  return 'No label';
};

// Gets the node label variable and returns its value, or "No label".
// See: https://github.com/codaco/Network-Canvas/wiki/Node-Labeling
export const makeGetNodeLabel = () => createDeepEqualSelector(
  (state, props) => {
    const getNodeTypeDefinition = makeGetNodeTypeDefinition(state, props);
    return getNodeTypeDefinition(state, props);
  },
  nodeTypeDefinition => node => labelLogic(nodeTypeDefinition, getEntityAttributes(node)),
);

export const makeGetNodeColor = () => createDeepEqualSelector(
  getProtocolCodebook,
  (_, props) => props.type,
  (codebook, nodeType) => {
    const nodeInfo = codebook.node;
    return (nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].color) || 'node-color-seq-1';
  },
);

export const makeGetEdgeLabel = () => createDeepEqualSelector(
  getProtocolCodebook,
  (_, props) => props.type,
  (codebook, edgeType) => {
    const edgeInfo = codebook.edge;
    return (edgeInfo && edgeInfo[edgeType] && edgeInfo[edgeType].label) || '';
  },
);

export const makeGetEdgeColor = () => createDeepEqualSelector(
  getProtocolCodebook,
  (_, props) => props.type,
  (codebook, edgeType) => {
    const edgeInfo = codebook.edge;
    return (edgeInfo && edgeInfo[edgeType] && edgeInfo[edgeType].color) || 'edge-color-seq-1';
  },
);

export const makeGetNodeAttributeLabel = () => createDeepEqualSelector(
  getProtocolCodebook,
  (_, props) => props.subject.type,
  (_, props) => props.variableId,
  (codebook, nodeType, variableId) => {
    const nodeInfo = codebook.node;
    const variables = (nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].variables) || {};
    return (variables && variables[variableId] && variables[variableId].label) || [];
  },
);

export const makeGetCategoricalOptions = () => createDeepEqualSelector(
  (state, props) => getProtocolCodebook(state, props),
  (_, props) => props.subject.type,
  (_, props) => props.variableId,
  (codebook, nodeType, variableId) => {
    const nodeInfo = codebook.node;
    const variables = (nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].variables) || {};
    return (variables && variables[variableId] && variables[variableId].options) || [];
  },
);
