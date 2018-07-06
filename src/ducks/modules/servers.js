const ADD_SERVER = 'ADD_SERVER';
const SERVER_PAIRING_FAILED = 'SERVER_PAIRING_FAILED';

const initialState = {
  paired: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_SERVER:
      if (action.server) {
        const pairingInfo = {
          ...action.server,
          deviceId: action.deviceId,
          deviceSecret: action.deviceSecret,
        };
        return { ...state, paired: [...state.paired, pairingInfo] };
      }
      return state;
    default:
      return state;
  }
}

const addServer = (server, deviceId, deviceSecret) => ({
  type: ADD_SERVER,
  deviceId,
  deviceSecret,
  server,
});

const pairingFailed = error => ({
  type: SERVER_PAIRING_FAILED,
  error,
});

const actionCreators = {
  addServer,
  pairingFailed,
};

const actionTypes = {
  ADD_SERVER,
  SERVER_PAIRING_FAILED,
};

export {
  actionCreators,
  actionTypes,
};
