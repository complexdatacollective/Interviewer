import { omit, each, map } from 'lodash';
import { Observable } from 'rxjs';
import { combineEpics } from 'redux-observable';

import uuidv4 from '../../utils/uuid';
import network, { entityPrimaryKeyProperty, ADD_NODE, BATCH_ADD_NODES, REMOVE_NODE, REMOVE_NODE_FROM_PROMPT, UPDATE_NODE, TOGGLE_NODE_ATTRIBUTES, ADD_EDGE, UPDATE_EDGE, TOGGLE_EDGE, REMOVE_EDGE, UPDATE_EGO } from './network';
import ApiClient from '../../utils/ApiClient';
import { protocolIdFromSessionPath } from '../../utils/matchSessionPath';

const ADD_SESSION = 'ADD_SESSION';
const UPDATE_SESSION = 'UPDATE_SESSION';
const UPDATE_PROMPT = 'UPDATE_PROMPT';
const REMOVE_SESSION = 'REMOVE_SESSION';
const EXPORT_SESSION = 'EXPORT_SESSION';
const EXPORT_SESSION_FAILED = 'EXPORT_SESSION_FAILED';
const EXPORT_SESSION_SUCCEEDED = 'EXPORT_SESSION_SUCCEEDED';

const initialState = {};

const withTimestamp = session => ({
  ...session,
  updatedAt: Date.now(),
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_NODE:
    case BATCH_ADD_NODES:
    case REMOVE_NODE:
    case REMOVE_NODE_FROM_PROMPT:
    case UPDATE_NODE:
    case TOGGLE_NODE_ATTRIBUTES:
    case ADD_EDGE:
    case UPDATE_EDGE:
    case TOGGLE_EDGE:
    case REMOVE_EDGE:
    case UPDATE_EGO:
      return {
        ...state,
        [action.sessionId]: withTimestamp({
          ...state[action.sessionId],
          network: network(state[action.sessionId].network, action),
        }),
      };
    case ADD_SESSION:
      return {
        ...state,
        [action.sessionId]: withTimestamp({
          path: action.path,
          promptIndex: 0,
          network: network(state.network, action),
        }),
      };
    case UPDATE_SESSION:
      return {
        ...state,
        [action.sessionId]: withTimestamp({
          ...state[action.sessionId],
          path: action.path,
          protocolPath: protocolIdFromSessionPath(action.path),
          promptIndex: 0,
        }),
      };
    case UPDATE_PROMPT:
      return {
        ...state,
        [action.sessionId]: withTimestamp({
          ...state[action.sessionId],
          promptIndex: action.promptIndex,
        }),
      };
    case REMOVE_SESSION:
      return omit(state, [action.sessionId]);
    case EXPORT_SESSION_SUCCEEDED:
      return {
        ...state,
        [action.sessionId]: withTimestamp({
          ...state[action.sessionId],
          lastExportedAt: Date.now(),
        }),
      };
    default:
      return state;
  }
}

/**
 * Add a batch of nodes to the state.
 *
 * @param {Collection} [nodeList] An array of objects representing nodes to add.
 * @param {Object} [attributeData] Attribute data that will be merged with each node
 *
 * @memberof! NetworkActionCreators
 */
const batchAddNodes = (nodeList, attributeData) => (dispatch, getState) => {
  const { session: sessionId, protocol: { variableRegistry: { node: nodeRegistry } } } = getState();
  const nodeTypes = map(nodeList, 'type');

  const registryForTypes = {};
  each(nodeTypes, (nodeType) => {
    registryForTypes[nodeType] = nodeRegistry[nodeType].variables;
  });

  dispatch({
    type: BATCH_ADD_NODES,
    sessionId,
    nodeList,
    attributeData,
    registryForTypes,
  });
};

/**
 * This function generates default values for all variables in the variable registry for this node
 * type.
 *
 * @param {object} registryForType - An object containing the variable registry entry for this
 *                                   node type.
 */

const getDefaultAttributesForEntityType = (registryForType = {}) => {
  const defaultAttributesObject = {};

  // Boolean variables are initialised as `false`, and everything else as `null`
  Object.keys(registryForType).forEach((key) => {
    defaultAttributesObject[key] = registryForType[key].type === 'boolean' ? false : null;
  });

  return defaultAttributesObject;
};

const addNode = (modelData, attributeData = {}) => (dispatch, getState) => {
  const { session: sessionId, protocol: { variableRegistry: { node: nodeRegistry } } } = getState();
  const registryForType = nodeRegistry[modelData.type].variables;

  dispatch({
    type: ADD_NODE,
    sessionId,
    modelData,
    attributeData: {
      ...getDefaultAttributesForEntityType(registryForType),
      ...attributeData,
    },
  });
};

const updateNode = (nodeId, newModelData = {}, newAttributeData = {}) => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: UPDATE_NODE,
    sessionId: session,
    nodeId,
    newModelData,
    newAttributeData,
  });
};

const toggleNodeAttributes = (uid, attributes) => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: TOGGLE_NODE_ATTRIBUTES,
    sessionId: session,
    [entityPrimaryKeyProperty]: uid,
    attributes,
  });
};

const removeNode = uid => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: REMOVE_NODE,
    sessionId: session,
    [entityPrimaryKeyProperty]: uid,
  });
};

const removeNodeFromPrompt = (nodeId, promptId, promptAttributes) => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: REMOVE_NODE_FROM_PROMPT,
    sessionId: session,
    nodeId,
    promptId,
    promptAttributes,
  });
};

const updateEgo = (modelData = {}, attributeData = {}) => (dispatch, getState) => {
  const { session: sessionId, protocol: { variableRegistry: { ego: egoRegistry } } } = getState();
  dispatch({
    type: UPDATE_EGO,
    sessionId,
    modelData,
    attributeData: {
      ...getDefaultAttributesForEntityType(egoRegistry.variables),
      ...attributeData,
    },
  });
};

const addEdge = (modelData, attributeData = {}) => (dispatch, getState) => {
  const { session: sessionId, protocol: { variableRegistry: { edge: edgeRegistry } } } = getState();
  const registryForType = edgeRegistry[modelData.type].variables;

  dispatch({
    type: ADD_EDGE,
    sessionId,
    modelData,
    attributeData: {
      ...getDefaultAttributesForEntityType(registryForType),
      ...attributeData,
    },
  });
};

const updateEdge = (edgeId, newModelData = {}, newAttributeData = {}) => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: UPDATE_EDGE,
    sessionId: session,
    edgeId,
    newModelData,
    newAttributeData,
  });
};

const toggleEdge = (modelData, attributeData = {}) => (dispatch, getState) => {
  const { session: sessionId, protocol: { variableRegistry: { edge: edgeRegistry } } } = getState();
  const registryForType = edgeRegistry[modelData.type].variables;

  dispatch({
    type: TOGGLE_EDGE,
    sessionId,
    modelData,
    attributeData: {
      ...getDefaultAttributesForEntityType(registryForType),
      ...attributeData,
    },
  });
};

const removeEdge = edge => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: REMOVE_EDGE,
    sessionId: session,
    edge,
  });
};

function addSession() {
  const id = uuidv4();
  return {
    type: ADD_SESSION,
    sessionId: id,
    path: `/session/${id}`,
  };
}

// This specifically updates the path/URL
function updateSession(id, path) {
  return {
    type: UPDATE_SESSION,
    sessionId: id,
    path,
  };
}

const updatePrompt = promptIndex => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: UPDATE_PROMPT,
    sessionId: session,
    promptIndex,
  });
};

function removeSession(id) {
  return {
    type: REMOVE_SESSION,
    sessionId: id,
  };
}

const sessionExportSucceeded = id => ({
  type: EXPORT_SESSION_SUCCEEDED,
  sessionId: id,
});

const sessionExportFailed = error => ({
  type: EXPORT_SESSION_FAILED,
  error,
});

// sessionData should already be in an exportable format (e.g., IDs transposed to names)
const exportSession = (remoteProtocolId, sessionUuid, sessionData) => ({
  type: EXPORT_SESSION,
  remoteProtocolId,
  sessionUuid,
  sessionData,
});

const sessionExportPromise = (pairedServer, action) => {
  const { remoteProtocolId, sessionUuid, sessionData } = action;
  if (pairedServer) {
    const client = new ApiClient(pairedServer);
    return client.addTrustedCert().then(() =>
      client.exportSession(remoteProtocolId, sessionUuid, sessionData));
  }
  return Promise.reject(new Error('No paired server available'));
};

const exportSessionEpic = (action$, store) => (
  action$.ofType(EXPORT_SESSION)
    .exhaustMap((action) => {
      const pairedServer = store.getState().pairedServer;
      return Observable
        .fromPromise(sessionExportPromise(pairedServer, action))
        .mapTo(sessionExportSucceeded(action.sessionUuid))
        .catch(error => Observable.of(sessionExportFailed(error)));
    })
);

const actionCreators = {
  addNode,
  batchAddNodes,
  updateNode,
  removeNode,
  removeNodeFromPrompt,
  updateEgo,
  addEdge,
  updateEdge,
  toggleEdge,
  removeEdge,
  toggleNodeAttributes,
  addSession,
  updateSession,
  updatePrompt,
  removeSession,
  exportSession,
  sessionExportFailed,
};

const actionTypes = {
  ADD_NODE,
  BATCH_ADD_NODES,
  REMOVE_NODE,
  REMOVE_NODE_FROM_PROMPT,
  UPDATE_NODE,
  TOGGLE_NODE_ATTRIBUTES,
  ADD_EDGE,
  UPDATE_EDGE,
  TOGGLE_EDGE,
  REMOVE_EDGE,
  UPDATE_EGO,
  ADD_SESSION,
  UPDATE_SESSION,
  UPDATE_PROMPT,
  REMOVE_SESSION,
  EXPORT_SESSION,
  EXPORT_SESSION_FAILED,
};

const epics = combineEpics(
  exportSessionEpic,
);

export {
  actionCreators,
  actionTypes,
  epics,
};
