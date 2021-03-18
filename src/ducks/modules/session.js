import { push } from 'connected-react-router';
import { actionTypes as SessionsActionTypes, actionCreators as SessionsActions } from './sessions';
import { actionCreators as SessionWorkerActions } from './sessionWorkers';
import { actionTypes as installedProtocolsActionTypes } from './installedProtocols';

const { ADD_SESSION } = SessionsActionTypes;
const SET_SESSION = 'SET_SESSION';
const END_SESSION = 'END_SESSION';

const initialState = null;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_SESSION:
    case ADD_SESSION:
      return action.sessionId;
    case END_SESSION:
    case installedProtocolsActionTypes.DELETE_PROTOCOL:
      return initialState;
    default:
      return state;
  }
}

/**
 * setSession can be used to resume an interview (e.g. from GUI, or URL on load)
 */
const setSession = (id) => (dispatch, getState) => {
  const { sessions } = getState();
  if (!sessions[id]) { return; }

  const sessionProtocolUID = sessions[id].protocolUID;

  dispatch(SessionWorkerActions.initializeSessionWorkersThunk(sessionProtocolUID));

  dispatch({
    type: SET_SESSION,
    sessionId: id,
  });
};

const endSession = (alsoDelete = false, markAsFinished = false) => (dispatch, getState) => {
  if (markAsFinished) {
    const { activeSessionId } = getState();
    dispatch(SessionsActions.setSessionFinished(activeSessionId));
  }

  dispatch({
    type: END_SESSION,
  });

  dispatch(push('/'));

  dispatch(SessionWorkerActions.resetWorkerMapAction());

  if (alsoDelete) {
    const { activeSessionId } = getState();
    dispatch(SessionsActions.removeSession(activeSessionId));
  }
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
