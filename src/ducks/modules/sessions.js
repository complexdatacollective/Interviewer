import { isArray, omit } from 'lodash';
import { Observable } from 'rxjs';
import { combineEpics } from 'redux-observable';

import uuidv4 from '../../utils/uuid';
import network, { nodePrimaryKeyProperty, ADD_NODE, ADD_NODES, REMOVE_NODE, UPDATE_NODE, TOGGLE_NODE_ATTRIBUTES, ADD_EDGE, TOGGLE_EDGE, REMOVE_EDGE, SET_EGO, UNSET_EGO } from './network';
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
    case ADD_NODES:
    case REMOVE_NODE:
    case UPDATE_NODE:
    case TOGGLE_NODE_ATTRIBUTES:
    case ADD_EDGE:
    case TOGGLE_EDGE:
    case REMOVE_EDGE:
    case SET_EGO:
    case UNSET_EGO:
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
 * Add a node or nodes to the state.
 *
 * @param {Array|Object} nodes - one or more nodes to add
 * @param {Object} [additionalProperties] shared properties to apply to every new node. Note that
 *                                        user data (e.g., the "additionalAttributes" defined in
 *                                        a protocol) should exist under a child property named
 *                                        'attributes'.
 *
 * @memberof! NetworkActionCreators
 */
const addNodes = (nodes, additionalProperties) => (dispatch, getState) => {
  const { session } = getState();

  let nodeOrNodes = nodes;
  if (!isArray(nodeOrNodes)) {
    nodeOrNodes = [nodeOrNodes];
  }
  dispatch({
    type: ADD_NODES,
    sessionId: session,
    nodes: nodeOrNodes,
    additionalProperties,
  });
};

const addNode = (modelData, attributeData) => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: ADD_NODE,
    sessionId: session,
    modelData,
    attributeData,
  });
};

const updateNode = (node, additionalProperties = null) => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: UPDATE_NODE,
    sessionId: session,
    node,
    additionalProperties,
  });
};

const toggleNodeAttributes = (uid, attributes) => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: TOGGLE_NODE_ATTRIBUTES,
    sessionId: session,
    [nodePrimaryKeyProperty]: uid,
    attributes,
  });
};

const removeNode = uid => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: REMOVE_NODE,
    sessionId: session,
    [nodePrimaryKeyProperty]: uid,
  });
};

const addEdge = edge => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: ADD_EDGE,
    sessionId: session,
    edge,
  });
};

const toggleEdge = edge => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: TOGGLE_EDGE,
    sessionId: session,
    edge,
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
  addNodes,
  updateNode,
  removeNode,
  addEdge,
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
  ADD_NODES,
  REMOVE_NODE,
  UPDATE_NODE,
  TOGGLE_NODE_ATTRIBUTES,
  ADD_EDGE,
  TOGGLE_EDGE,
  REMOVE_EDGE,
  SET_EGO,
  UNSET_EGO,
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
