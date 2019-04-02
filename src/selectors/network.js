import { findKey } from 'lodash';
import { getActiveSession, getCaseId } from './session';
import { createDeepEqualSelector } from './utils';
import { getProtocolCodebook } from './protocol';
import { makeGetSubjectType } from './interface';
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

export const makeGetNodeDisplayVariable = () => createDeepEqualSelector(
  (state, props) => getProtocolCodebook(state, props),
  (state, props) => makeGetSubjectType(state, props),
  (codebook, nodeType) => {
    const nodeInfo = codebook.node;
    return nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].displayVariable;
  },
);

export const getNodeLabelFunction = createDeepEqualSelector(
  (state, props) => getProtocolCodebook(state, props),
  codebook => (node) => {
    const nodeInfo = codebook.node;

    // Get the display variable by looking up the node type in the variable registry
    const displayVariable = nodeInfo && node && node.type && nodeInfo[node.type] &&
      nodeInfo[node.type].displayVariable;

    // For fallback: get the first variable of type 'text'
    const firstTextVariable = nodeInfo && node && node.type && nodeInfo[node.type] &&
      nodeInfo[node.type].variables && findKey(nodeInfo[node.type].variables, ['type', 'text']);

    // Get the data model properties from the node
    const nodeDataModelProps = getEntityAttributes(node);
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
