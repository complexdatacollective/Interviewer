import { findKey, compact } from 'lodash';
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
  (state, props) => (props && props.type) || (state && state.type),
  (codebook, nodeType) => {
    const nodeInfo = codebook && codebook.node;
    return nodeInfo && nodeInfo[nodeType];
  },
);

const labelLogic = (codebookForNodeType) => {
  // Get the display variable, if explicitly set.
  const displayVariable = codebookForNodeType && codebookForNodeType.displayVariable;

  // Get any variable with the name "label"
  const variableCalledLabel = codebookForNodeType && codebookForNodeType.variables && findKey(codebookForNodeType.variables, ['name', 'label']);

  // Get the first variable of type 'text'
  const firstTextVariable = codebookForNodeType && codebookForNodeType.variables && findKey(codebookForNodeType.variables, ['type', 'text']);

  // First, try to use the displayVariable for the node type
  // else try to use a variable named "label"
  // else try to use the first text variable
  // else return the string "No label"

  // Check if the variable actually exists before making it available to return.
  return compact([displayVariable, variableCalledLabel, firstTextVariable]);
};


export const getLabelVariableForNodeType = () => createDeepEqualSelector(
  (state, props) => {
    const getNodeTypeDefinition = makeGetNodeTypeDefinition(state, props);
    return getNodeTypeDefinition(state, props);
  },
  nodeTypeDefinition => labelLogic(nodeTypeDefinition),
);

export const getLabelVariableForStageSubject = () => createDeepEqualSelector(
  (state, props) => {
    const getNodeTypeDefinition = makeGetNodeTypeDefinition(state, props.stage.subject);
    return getNodeTypeDefinition(state, props.stage.subject);
  },
  nodeTypeDefinition => labelLogic(nodeTypeDefinition),
);

// Gets the node label variable and returns its value, or "No label".
export const makeGetNodeLabel = () => createDeepEqualSelector(
  getLabelVariableForNodeType(),
  nodeLabelVariable => (node) => {
    const nodeDataModelProps = getEntityAttributes(node);
    return (nodeLabelVariable[0] && nodeDataModelProps[nodeLabelVariable[0]]) ||
      'No label';
  },
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
    return (variables && variables[variableId] && variables[variableId].name) || variableId;
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
