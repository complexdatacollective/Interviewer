import ApiClient from '../../utils/ApiClient';

/*
 * State containing heartbeat response from Server.
 */

const initialState = {
  status: 'NOT_PAIRED',
  error: null,
};

const UPDATE = 'PAIRING_STATUS/UPDATE';

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE:
      return {
        ...state,
        ...action.state,
      };
    default:
      return state;
  }
}

const update = state => ({
  type: UPDATE,
  state,
});

const updatePairingStatus = () => (dispatch, getState) => {
  // If we aren't paired, abort
  const pairedServer = getState().pairedServer;

  if (!pairedServer) {
    return;
  }

  const apiClient = new ApiClient(pairedServer);

  apiClient
    .addTrustedCert()
    .then(() => apiClient.getProtocols())
    .then(() => dispatch(update({
      status: 'OK',
      error: null,
    })))
    .catch((error) => {
      dispatch(update({
        status: 'ERROR',
        error,
      }));
    });
};

const actionCreators = {
  updatePairingStatus,
};

const actionTypes = {
  UPDATE,
};

export {
  actionCreators,
  actionTypes,
};
