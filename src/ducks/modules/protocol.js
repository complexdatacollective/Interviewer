/* eslint-disable max-len */

import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import getProtocol from '../../utils/getProtocol';
import runProtocol from '../../utils/runProtocol';
import demoProtocol from '../../other/demo.canvas/protocol.json';

const LOAD_PROTOCOL = 'LOAD_PROTOCOL';
const LOAD_DEMO_PROTOCOL = 'LOAD_DEMO_PROTOCOL';
const LOAD_PROTOCOL_FAILED = 'LOAD_PROTOCOL_FAILED';
const SET_PROTOCOL = 'SET_PROTOCOL';

const initialState = {
  isLoaded: false,
  name: '',
  version: '',
  required: '',
  stages: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PROTOCOL:
      return {
        ...state,
        ...action.protocol,
        path: action.path,
        isLoaded: true,
      };
    default:
      return state;
  }
}

function setProtocol(path, protocol) {
  return {
    type: SET_PROTOCOL,
    path,
    protocol,
  };
}

function loadProtocol(path) {
  return {
    type: LOAD_PROTOCOL,
    path,
  };
}

function loadDemoProtocol() {
  return {
    type: LOAD_DEMO_PROTOCOL,
  };
}

function loadProtocolFailed(error) {
  return {
    type: LOAD_PROTOCOL_FAILED,
    error,
  };
}

const loadProtocolEpic = action$ =>
  action$.ofType(LOAD_PROTOCOL) // Filter for load protocol action
    .switchMap(action => // Favour subsequent load actions over earlier ones
      Observable
        .fromPromise(getProtocol(action.path)) // Get protocol
        .map(response => setProtocol(action.path, response)) // Parse and save
        .catch(error => Observable.of(loadProtocolFailed(error))), //  ...or throw an error
    );

const loadDemoProtocolEpic = action$ =>
  action$.ofType(LOAD_DEMO_PROTOCOL)
    .map(() => setProtocol(null, demoProtocol));

const actionCreators = {
  loadProtocol,
  setProtocol,
  loadDemoProtocol,
};

const actionTypes = {
  LOAD_PROTOCOL,
  LOAD_DEMO_PROTOCOL,
  SET_PROTOCOL,
};

const epics = combineEpics(
  loadProtocolEpic,
  loadDemoProtocolEpic,
);

export {
  actionCreators,
  actionTypes,
  epics,
};
