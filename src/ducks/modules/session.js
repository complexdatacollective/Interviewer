const SET_SESSION = 'SET_SESSION';
const ADD_SESSION = 'ADD_SESSION';
const END_SESSION = 'END_SESSION';

const initialState = 'CREATE_NEW';

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

function setSession(id, protocolType) {
  return {
    type: SET_SESSION,
    sessionId: id,
    protocolType,
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
};
