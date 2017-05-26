import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import axios from 'axios';
import runProtocol from '../../utils/runProtocol';

const LOAD_PROTOCOL = 'LOAD_PROTOCOL';
const LOAD_PROTOCOL_FAILED = 'LOAD_PROTOCOL_FAILED';
const SET_PROTOCOL = 'SET_PROTOCOL';

const initialState = {
  config: {
    name: '',
    version: '',
    required: '',
    stages: [],
  },
  loaded: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PROTOCOL:
      return {
        ...state,
        loaded: true,
        config: {
          ...state.config,
          ...action.protocol.config,
        },
      };
    default:
      return state;
  }
}

function setProtocol(protocol) {
  return {
    type: SET_PROTOCOL,
    protocol,
  };
}

function loadProtocol(path) {
  return {
    type: LOAD_PROTOCOL,
    path,
  };
}

function loadProtocolFailed(error) {
  return {
    type: LOAD_PROTOCOL_FAILED,
    error,
  };
}

const protocolRequest = url => axios({
  url,
  contentType: 'application/javascript',
});

const loadProtocolEpic = action$ =>
  action$.ofType(LOAD_PROTOCOL)
    .switchMap(action =>
      Observable
        .fromPromise(protocolRequest(action.path))
        .map(response => setProtocol(runProtocol(response.data)))
        .catch(error => Observable.of(loadProtocolFailed(error))),
    );

const actionCreators = {
  loadProtocol,
  setProtocol,
};

const actionTypes = {
  LOAD_PROTOCOL,
  SET_PROTOCOL,
};

const epics = combineEpics(
  loadProtocolEpic,
);

export {
  actionCreators,
  actionTypes,
  epics,
};
