/* eslint-disable max-len */

import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { loadProtocol, importProtocol, downloadProtocol } from '../../utils/protocol';
import demoProtocol from '../../other/demo.canvas/protocol.json';

const DOWNLOAD_PROTOCOL = 'PROTOCOL/DOWNLOAD_PROTOCOL';
const DOWNLOAD_PROTOCOL_FAILED = 'PROTOCOL/DOWNLOAD_PROTOCOL_FAILED';
const IMPORT_PROTOCOL = 'PROTOCOL/IMPORT_PROTOCOL';
const IMPORT_PROTOCOL_FAILED = 'PROTOCOL/IMPORT_PROTOCOL';
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

function downloadProtocolAction(uri) {
  return {
    type: DOWNLOAD_PROTOCOL,
    uri,
  };
}

function importProtocolAction(path) {
  return {
    type: IMPORT_PROTOCOL,
    path,
  };
}

function loadProtocolAction(path) {
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

function importProtocolFailed(error) {
  return {
    type: IMPORT_PROTOCOL_FAILED,
    error,
  };
}

function downloadProtocolFailed(error) {
  return {
    type: DOWNLOAD_PROTOCOL_FAILED,
    error,
  };
}

const downloadProtocolEpic = action$ =>
  action$.ofType(DOWNLOAD_PROTOCOL)
    .switchMap(action =>
      Observable
        .fromPromise(downloadProtocol(action.uri))
        .map(protocolPath => importProtocolAction(protocolPath))
        .catch(error => Observable.of(downloadProtocolFailed(error))),
    );

const importProtocolEpic = action$ =>
  action$.ofType(IMPORT_PROTOCOL)
    .switchMap(action =>
      Observable
        .fromPromise(importProtocol(action.path))
        .map(protocolName => loadProtocolAction(protocolName))
        .catch(error => Observable.of(importProtocolFailed(error))),
    );

const loadProtocolEpic = action$ =>
  action$.ofType(LOAD_PROTOCOL) // Filter for load protocol action
    .switchMap(action => // Favour subsequent load actions over earlier ones
      Observable
        .fromPromise(loadProtocol(action.path)) // Get protocol
        .map(response => setProtocol(action.path, response)) // Parse and save
        .catch(error => Observable.of(loadProtocolFailed(error))), //  ...or throw an error
    );

const loadDemoProtocolEpic = action$ =>
  action$.ofType(LOAD_DEMO_PROTOCOL)
    .map(() => setProtocol(null, demoProtocol));

const actionCreators = {
  loadProtocol: loadProtocolAction,
  importProtocol: importProtocolAction,
  downloadProtocol: downloadProtocolAction,
  setProtocol,
  loadDemoProtocol,
};

const actionTypes = {
  IMPORT_PROTOCOL,
  IMPORT_PROTOCOL_FAILED,
  DOWNLOAD_PROTOCOL,
  DOWNLOAD_PROTOCOL_FAILED,
  LOAD_PROTOCOL,
  LOAD_PROTOCOL_FAILED,
  LOAD_DEMO_PROTOCOL,
  SET_PROTOCOL,
};

const epics = combineEpics(
  downloadProtocolEpic,
  importProtocolEpic,
  loadProtocolEpic,
  loadDemoProtocolEpic,
);

export {
  actionCreators,
  actionTypes,
  epics,
};
