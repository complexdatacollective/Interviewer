import { withErrorDialog } from './errors';
import { withToast } from './toasts';

const SET_SERVER = 'SET_SERVER';
const UNPAIR_SERVER = 'UNPAIR_SERVER';
const SERVER_PAIRING_FAILED = 'SERVER_PAIRING_FAILED';

const initialState = null;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case UNPAIR_SERVER:
      return initialState;
    case SET_SERVER:
      if (action.server) {
        return {
          ...action.server,
          deviceId: action.deviceId,
          deviceSecret: action.deviceSecret,
        };
      }
      return state;
    default:
      return state;
  }
}

const setPairedServer = withToast((server, deviceId, deviceSecret) => ({
  type: SET_SERVER,
  deviceId,
  deviceSecret,
  server,
}));

const unpairServer = () => ({
  type: UNPAIR_SERVER,
});

const pairingFailed = withErrorDialog((error) => ({
  type: SERVER_PAIRING_FAILED,
  error,
}));

const actionCreators = {
  setPairedServer,
  pairingFailed,
  unpairServer,
};

const actionTypes = {
  SET_SERVER,
  SERVER_PAIRING_FAILED,
  UNPAIR_SERVER,
};

export {
  actionCreators,
  actionTypes,
};
