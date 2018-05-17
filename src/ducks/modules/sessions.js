import { isArray, omit } from 'lodash';
import uuidv4 from 'uuid/v4';

import network, { ADD_NODES, REMOVE_NODE, UPDATE_NODE, TOGGLE_NODE_ATTRIBUTES, ADD_EDGE, TOGGLE_EDGE, REMOVE_EDGE, SET_EGO, UNSET_EGO } from './network';

const ADD_SESSION = 'ADD_SESSION';
const UPDATE_SESSION = 'UPDATE_SESSION';
const UPDATE_PROMPT = 'UPDATE_PROMPT';
const REMOVE_SESSION = 'REMOVE_SESSION';

const initialState = {};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
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
        [action.sessionId]: {
          ...state[action.sessionId],
          network: network(state[action.sessionId].network, action),
        },
      };
    case ADD_SESSION:
      return {
        ...state,
        [action.sessionId]: {
          path: action.path,
          promptIndex: 0,
          network: network(state.network, action),
        },
      };
    case UPDATE_SESSION:
      return {
        ...state,
        [action.sessionId]: {
          ...state[action.sessionId],
          path: action.path,
          promptIndex: 0,
        },
      };
    case UPDATE_PROMPT:
      return {
        ...state,
        [action.sessionId]: {
          ...state[action.sessionId],
          promptIndex: action.promptIndex,
        },
      };
    case REMOVE_SESSION:
      return omit(state, [action.sessionId]);
    default:
      return state;
  }
}

/**
 * Add a node or nodes to the state.
 *
 * @param {Array|Object} nodes - one or more nodes to add
 * @param {Object} [additionalAttributes] shared attributes to apply to every
 *  new node
 *
 * @memberof! NetworkActionCreators
 */
const addNodes = (nodes, additionalAttributes) => (dispatch, getState) => {
  const { session } = getState();

  let nodeOrNodes = nodes;
  if (!isArray(nodeOrNodes)) {
    nodeOrNodes = [nodeOrNodes];
  }
  dispatch({
    type: ADD_NODES,
    sessionId: session,
    nodes: nodeOrNodes,
    additionalAttributes,
  });
};

const updateNode = (node, full = false) => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: UPDATE_NODE,
    sessionId: session,
    node,
    full,
  });
};

const toggleNodeAttributes = (uid, attributes) => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: TOGGLE_NODE_ATTRIBUTES,
    sessionId: session,
    uid,
    attributes,
  });
};

const removeNode = uid => (dispatch, getState) => {
  const { session } = getState();

  dispatch({
    type: REMOVE_NODE,
    sessionId: session,
    uid,
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

const actionCreators = {
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
};

const actionTypes = {
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
};

export {
  actionCreators,
  actionTypes,
};
