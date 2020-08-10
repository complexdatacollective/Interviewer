const UPDATE_BLOCKED = Symbol('UPDATE/UPDATE_BLOCKED');
const UPDATE_PENDING = Symbol('UPDATE/UPDATE_PENDING');
const UPDATE_UNAVAILABLE = Symbol('UPDATE/UPDATE_UNAVAILABLE');
const ERROR = Symbol('UPDATE/ERROR');
const RESET = Symbol('UPDATE/RESET');

const STATES = {
  error: 'error', // error - there was an error during the process
  blocked: 'blocked', // blocked - update available, but app isn't updatable
  pending: 'pending', // pending - app will be updated on next start.
  unavailable: 'unavailable', // unavailable - no updates
};

const initialState = {
  status: null,
  error: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET:
      return initialState;
    case UPDATE_BLOCKED:
      return {
        ...initialState,
        status: STATES.blocked,
      };
    case UPDATE_UNAVAILABLE:
      return {
        ...initialState,
        status: STATES.unavailable,
      };
    case UPDATE_PENDING:
      return {
        ...initialState,
        status: STATES.pending,
      };
    case ERROR:
      return {
        ...state,
        status: STATES.error,
        error: action.error,
      };
    default:
      return state;
  }
}

const setUpdateBlocked = () => ({
  type: UPDATE_BLOCKED,
});

const setUpdatePending = () => ({
  type: UPDATE_PENDING,
});

const setUpdateUnavailable = () => ({
  type: UPDATE_UNAVAILABLE,
});

const setUpdateError = error => ({
  type: ERROR,
  error,
});

// check for update thunk
// cordova -> calls codePush.sync
// electron -> dispatches check-for-updates over IPC

const actionCreators = {
  setUpdateBlocked,
  setUpdatePending,
  setUpdateUnavailable,
  setUpdateError,
};

const actionTypes = {
  UPDATE_BLOCKED,
  ERROR,
};

export {
  actionCreators,
  actionTypes,
};
