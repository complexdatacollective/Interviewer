import { actionTypes as errorActionTypes } from './protocol';
import { actionTypes as pairingErrorTypes } from './servers';

const ERROR = 'ERRORS/ERROR';
const ACKNOWLEDGE_ERROR = 'ERRORS/ACKNOWLEDGE_ERROR';

const initialState = {
  errors: [],
  acknowledged: true,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ERROR:
    case errorActionTypes.DOWNLOAD_PROTOCOL_FAILED:
    case errorActionTypes.IMPORT_PROTOCOL_FAILED:
    case errorActionTypes.LOAD_PROTOCOL_FAILED:
    case pairingErrorTypes.SERVER_PAIRING_FAILED:
      // eslint-disable-next-line no-console
      console.error(action.error);
      return {
        ...state,
        acknowledged: false,
        errors: [...state.errors, action.error],
      };
    case ACKNOWLEDGE_ERROR:
      return {
        ...state,
        acknowledged: true,
      };
    default:
      return state;
  }
}

const acknowledge = () => ({
  type: ACKNOWLEDGE_ERROR,
});

const errorAction = e => ({
  type: ERROR,
  error: e,
});

const actionCreators = {
  acknowledge,
  error: errorAction,
};

const actionTypes = {
  ERROR,
  ACKNOWLEDGE_ERROR,
};

export {
  actionCreators,
  actionTypes,
};
