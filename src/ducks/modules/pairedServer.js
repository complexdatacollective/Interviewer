const SET_SERVER = 'SET_SERVER';
const SERVER_PAIRING_FAILED = 'SERVER_PAIRING_FAILED';

const initialState = null;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
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

const setPairedServer = (server, deviceId, deviceSecret) => ({
  type: SET_SERVER,
  deviceId,
  deviceSecret,
  server,
});

const pairingFailed = error => ({
  type: SERVER_PAIRING_FAILED,
  error,
});

const actionCreators = {
  setPairedServer,
  pairingFailed,
};

const actionTypes = {
  SET_SERVER,
  SERVER_PAIRING_FAILED,
};

export {
  actionCreators,
  actionTypes,
};
