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
  (state, props) => props.type,
  (variableRegistry, nodeType) => {
    const nodeInfo = variableRegistry.node;
    return nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].color;
  },
);

export const makeGetEdgeColor = () => createDeepEqualSelector(
  protocolRegistry,
  (state, props) => props.type,
  (variableRegistry, edgeType) => {
    const edgeInfo = variableRegistry.edge;
    return edgeInfo && edgeInfo[edgeType] && edgeInfo[edgeType].color;
  },
);
export const getNodeLabelWorkerUrl = createSelector(
  // null if URLs haven't yet loaded; false if worker does not exist
  state => state.protocol.workerUrlMap &&
    (state.protocol.workerUrlMap[NodeLabelWorkerName] || false),
  url => url,
);
