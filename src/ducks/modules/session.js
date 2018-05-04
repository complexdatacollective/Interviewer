const SET_SESSION = 'SET_SESSION';
const ADD_SESSION = 'ADD_SESSION';

const initialState = 'CREATE_NEW';

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_SESSION:
    case ADD_SESSION:
      return action.sessionId;
    default:
      return state;
  }
}

function setSession(id) {
  return {
    type: SET_SESSION,
    sessionId: id,
  };
}

const actionCreators = {
  setSession,
};

const actionTypes = {
  SET_SESSION,
};

export {
  actionCreators,
  actionTypes,
};
