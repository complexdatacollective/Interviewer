import { actionTypes as SessionsActionTypes } from './sessions';

const ADD_SESSION = SessionsActionTypes.ADD_SESSION;

const SET_SESSION = 'SET_SESSION';
const END_SESSION = 'END_SESSION';

const initialState = null;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_SESSION:
    case ADD_SESSION:
      return action.sessionId;
    case END_SESSION:
      return initialState;
    default:
      return state;
  }
}

/**
 * setSession can be used to resume an interview (e.g. from GUI, or URL on load)
 */
function setSession(id) {
  return {
    type: SET_SESSION,
    sessionId: id,
  };
}

function endSession() {
  return {
    type: END_SESSION,
  };
}

const actionCreators = {
  endSession,
  setSession,
};

const actionTypes = {
  END_SESSION,
  SET_SESSION,
};

export {
  actionCreators,
  actionTypes,
  initialState,
};
