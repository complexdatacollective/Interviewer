import ProtocolService from '../../utils/ProtocolService'

const protocolService = new ProtocolService();

const REQUEST_PROTOCOL = 'REQUEST_PROTOCOL';
const SET_PROTOCOL = 'SET_PROTOCOL';
const UNSET_PROTOCOL = 'UNSET_PROTOCOL';

const initialState = {
  protocolConfig: {
    'name': '',
    'version': '',
    'required': '',
    'stages': []
  },
  protocolLoaded: false
};

export default function(persistor) {
  return function reducer(state = initialState, action = {}) {
    switch (action.type) {
      case SET_PROTOCOL:
        return {
          ...state,
          protocolLoaded: true,
          protocolConfig: {
            ...state.protocolConfig,
            ...action.protocol
          }
        }
      case UNSET_PROTOCOL:
        persistor.purge(['protocol']);
        return initialState;
      default:
        return state;
    }
  };
};

function requestProtocol() {
  return { type: REQUEST_PROTOCOL }
}

function setProtocol(protocol) {
  return {
    type: SET_PROTOCOL,
    protocol
  }
}

function unsetProtocol() {
  return {
    type: UNSET_PROTOCOL
  }
}

function loadProtocol() {
  return dispatch => {
    dispatch(requestProtocol());
    dispatch(setProtocol(protocolService.getSampleProtocol()))
  }
}

const actionCreators = {
  loadProtocol,
  unsetProtocol
};

const actionTypes = {
  REQUEST_PROTOCOL,
  SET_PROTOCOL,
  UNSET_PROTOCOL
};

export {
  actionCreators,
  actionTypes
};
