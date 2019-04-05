import crypto from 'crypto';
import { createSelector } from 'reselect';
import { createDeepEqualSelector } from './utils';
import { getActiveSession } from './session';
import uuidv4 from '../utils/uuid';

const DefaultFinishStage = {
  // `id` is used as component key; must be unique from user input
  id: uuidv4(),
  type: 'FinishSession',
  label: 'Finish Interview',
};


/**
 * The remote protocol ID on any instance of Server is the hex-encoded sha256 of its [unique] name.
 * Server will need to know this ID when we export/import session data.
 */
const nameDigest = name => name && crypto.createHash('sha256').update(name).digest('hex');

export const getInstalledProtocols = state => state.installedProtocols;

export const getActiveProtocol = createSelector(
  (state, props) => getActiveSession(state, props),
  getInstalledProtocols,
  (session, protocols) => {
    if (!session) {
      return {};
    }
    return protocols[session.protocolUID];
  },
);

export const getProtocolCodebook = createSelector(
  getActiveProtocol,
  protocol => protocol.codebook,
);

export const getProtocolForms = createSelector(
  getActiveProtocol,
  protocol => protocol.forms,
);

export const getRemoteProtocolId = createDeepEqualSelector(
  getActiveProtocol,
  protocol => nameDigest(protocol.name) || null,
);

const withFinishStage = stages => (stages && stages.length ? [...stages, DefaultFinishStage] : []);

export const getProtocolStages = createSelector(
  getActiveProtocol,
  protocol => withFinishStage(protocol.stages),
);

// The user-defined name of a node type; e.g. `codebook.node[uuid].name == 'person'`
export const makeGetNodeTypeDefinition = () => createDeepEqualSelector(
  getProtocolCodebook,
  (state, props) => props.type,
  (codebook, nodeType) => {
    const nodeInfo = codebook && codebook.node;
    return nodeInfo && nodeInfo[nodeType];
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
