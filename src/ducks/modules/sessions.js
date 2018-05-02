import { omit } from 'lodash';

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
          path: action.path,
          network: state[action.sessionId].network,
        },
      };
    case REMOVE_SESSION:
      return omit(state, [action.sessionId]);
    default:
      return state;
  }
}

function addSession(id, path) {
  return {
    type: ADD_SESSION,
    sessionId: id, // TODO some unique value
    path,
  };
}

function updateSession(id, path) {
  return {
    type: UPDATE_SESSION,
    sessionId: id, // TODO current value
    path,
  };
}

function removeSession(id) {
  return {
    type: REMOVE_SESSION,
    sessionId: id, // TODO current value
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
