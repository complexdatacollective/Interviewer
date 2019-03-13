import { actionTypes as SessionsActionTypes } from './sessions';
import { actionCreators as SessionWorkerActions } from './sessionWorkers';

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
const setSession = id => (dispatch, getState) => {
  const { sessions, installedProtocols } = getState();
  console.log(id, sessions, installedProtocols);
  const protocolUID = sessions[id].protocolUID;
  const sessionProtocolPath = installedProtocols[protocolUID].path;

  dispatch(SessionWorkerActions.initializeSessionWorkersThunk(sessionProtocolPath));

  dispatch({
    type: SET_SESSION,
    sessionId: id,
  });
};

const endSession = () => (dispatch) => {
  dispatch(SessionWorkerActions.resetWorkerMapAction());
  dispatch({
    type: END_SESSION,
  });
};

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
