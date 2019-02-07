import crypto from 'crypto';
import { createSelector } from 'reselect';

import { createDeepEqualSelector } from './utils';
import { NodeLabelWorkerName } from '../utils/WorkerAgent';

/**
 * The remote protocol ID on any instance of Server is the hex-encoded sha256 of its [unique] name.
 * Server will need to know this ID when we export/import session data.
 */
const nameDigest = name => name && crypto.createHash('sha256').update(name).digest('hex');

export const protocolRegistry = createDeepEqualSelector(
  state => state.protocol && state.protocol.variableRegistry,
  registry => registry,
);

export const protocolForms = createDeepEqualSelector(
  state => state.protocol.forms,
  forms => forms,
);

export const getRemoteProtocolId = createDeepEqualSelector(
  state => state.protocol && state.protocol.type !== 'factory' && state.protocol.name,
  remoteName => nameDigest(remoteName) || null,
);

// The user-defined name of a node type; e.g. `variableRegistry.node[uuid].name == 'person'`
export const makeGetNodeTypeDefinition = () => createDeepEqualSelector(
  protocolRegistry,
  (state, props) => props.type,
  (variableRegistry, nodeType) => {
    const nodeInfo = variableRegistry && variableRegistry.node;
    return nodeInfo && nodeInfo[nodeType];
  },
);

export const makeGetNodeColor = () => createDeepEqualSelector(
  protocolRegistry,
  (_, props) => props.type,
  (variableRegistry, nodeType) => {
    const nodeInfo = variableRegistry.node;
    return (nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].color) || 'node-color-seq-1';
  },
);

export const makeGetEdgeLabel = () => createDeepEqualSelector(
  protocolRegistry,
  (_, props) => props.type,
  (variableRegistry, edgeType) => {
    const edgeInfo = variableRegistry.edge;
    return (edgeInfo && edgeInfo[edgeType] && edgeInfo[edgeType].label) || '';
  },
);

export const makeGetEdgeColor = () => createDeepEqualSelector(
  protocolRegistry,
  (_, props) => props.type,
  (variableRegistry, edgeType) => {
    const edgeInfo = variableRegistry.edge;
    return (edgeInfo && edgeInfo[edgeType] && edgeInfo[edgeType].color) || 'edge-color-seq-1';
  },
);

export const makeGetEgoLabel = () => createDeepEqualSelector(
  protocolRegistry,
  (variableRegistry) => {
    const egoInfo = variableRegistry.ego;
    return (egoInfo && egoInfo.label) || 'You';
  },
);

export const makeGetEgoColor = () => createDeepEqualSelector(
  protocolRegistry,
  (variableRegistry) => {
    const egoInfo = variableRegistry.ego;
    return (egoInfo && egoInfo.color) || 'node-color-seq-1';
  },
);

export const makeGetNodeAttributeLabel = () => createDeepEqualSelector(
  protocolRegistry,
  (_, props) => props.subject.type,
  (_, props) => props.variableId,
  (variableRegistry, nodeType, variableId) => {
    const nodeInfo = variableRegistry.node;
    const variables = (nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].variables) || {};
    return (variables && variables[variableId] && variables[variableId].label) || [];
  },
);

export const makeGetCategoricalOptions = () => createDeepEqualSelector(
  protocolRegistry,
  (_, props) => props.subject.type,
  (_, props) => props.variableId,
  (variableRegistry, nodeType, variableId) => {
    const nodeInfo = variableRegistry.node;
    const variables = (nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].variables) || {};
    return (variables && variables[variableId] && variables[variableId].options) || [];
  },
);

export const getNodeLabelWorkerUrl = createSelector(
  // null if URLs haven't yet loaded; false if worker does not exist
  state => state.protocol.workerUrlMap &&
    (state.protocol.workerUrlMap[NodeLabelWorkerName] || false),
  url => url,
);
