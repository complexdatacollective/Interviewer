/* eslint-disable import/prefer-default-export */
import crypto from 'crypto';

import { createDeepEqualSelector } from './utils';

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

export const getExternalData = createDeepEqualSelector(
  state => state.protocol.externalData,
  protocolData => protocolData,
);

export const getRemoteProtocolId = createDeepEqualSelector(
  state => state.protocol && state.protocol.type !== 'factory' && state.protocol.name,
  remoteName => nameDigest(remoteName) || null,
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
