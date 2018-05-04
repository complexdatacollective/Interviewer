import { omit } from 'lodash';
import uuidv4 from 'uuid/v4';

import network from './network';

const ADD_SESSION = 'ADD_SESSION';
const UPDATE_SESSION = 'UPDATE_SESSION';
const REMOVE_SESSION = 'REMOVE_SESSION';

const initialState = {};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_SESSION:
      return {
        ...state,
        [action.sessionId]: {
          path: action.path,
          network: network(state.network, action),
        },
      };
    case UPDATE_SESSION:
      return {
        ...state,
        [action.sessionId]: {
          ...state[action.sessionId],
          path: action.path,
        },
      };
    case REMOVE_SESSION:
      return omit(state, [action.sessionId]);
    default:
      return state;
  }
}

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

function removeSession(id) {
  return {
    type: REMOVE_SESSION,
    sessionId: id,
  };
}

const actionCreators = {
  addSession,
  updateSession,
  removeSession,
};

const actionTypes = {
  ADD_SESSION,
  UPDATE_SESSION,
  REMOVE_SESSION,
};

export {
  actionCreators,
  actionTypes,
};
