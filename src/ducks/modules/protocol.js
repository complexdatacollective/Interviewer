import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { loadProtocol, importProtocol, downloadProtocol, loadFactoryProtocol } from '../../utils/protocol';
import uuidv4 from '../../utils/uuid';
import { actionTypes as SessionActionTypes } from './session';


const END_SESSION = SessionActionTypes.END_SESSION;
const SET_SESSION = SessionActionTypes.SET_SESSION;

const DOWNLOAD_PROTOCOL = 'PROTOCOL/DOWNLOAD_PROTOCOL';
const DOWNLOAD_PROTOCOL_FAILED = Symbol('PROTOCOL/DOWNLOAD_PROTOCOL_FAILED');
const IMPORT_PROTOCOL = 'PROTOCOL/IMPORT_PROTOCOL';
const IMPORT_PROTOCOL_FAILED = Symbol('PROTOCOL/IMPORT_PROTOCOL_FAILED');
const LOAD_PROTOCOL = 'LOAD_PROTOCOL';
const LOAD_FACTORY_PROTOCOL = 'LOAD_FACTORY_PROTOCOL';
const LOAD_PROTOCOL_FAILED = Symbol('LOAD_PROTOCOL_FAILED');
const SET_PROTOCOL = 'SET_PROTOCOL';

const initialState = {
  isLoaded: false,
  isLoading: false,
  error: null,
  name: '',
  version: '',
  required: '',
  stages: [],
  type: 'factory',
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PROTOCOL:
      return {
        ...state,
        ...action.protocol,
        path: action.path,
        isLoaded: true,
        isLoading: false,
      };
    case SET_SESSION:
      if (action.protocolType) {
        return {
          ...state,
          isLoaded: false,
          isLoading: false,
          type: action.protocolType,
        };
      }
      return state;
    case END_SESSION:
      return initialState;
    case DOWNLOAD_PROTOCOL:
    case IMPORT_PROTOCOL:
    case LOAD_PROTOCOL:
    case LOAD_FACTORY_PROTOCOL:
      return {
        ...state,
        isLoaded: false,
        isLoading: true,
        type: action.protocolType,
      };
    case DOWNLOAD_PROTOCOL_FAILED:
    case IMPORT_PROTOCOL_FAILED:
    case LOAD_PROTOCOL_FAILED:
      return {
        ...state,
        isLoaded: false,
        isLoading: false,
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

// TODO: Simplify.
// A "name" (in protocol.json) uniquely identifies a protocol.
// The remoteId is a URL-safe version (digest) of this used by Servers.
// This is different than the other identifier for a protocol: the filepath (aka path, aka id).
// It's passed through the action chain just so it can be set on a session, which is
// created before protocol is loaded/parsed.
// i.e., Session export needs the protocol's remoteId (or protocol name).

function downloadProtocolAction(uri, remoteId) {
  return {
    type: DOWNLOAD_PROTOCOL,
    protocolType: 'download',
    remoteId,
    uri,
  };
}

function importProtocolAction(path, remoteId) {
  return {
    type: IMPORT_PROTOCOL,
    protocolType: 'download',
    remoteId,
    path,
  };
}

function loadProtocolAction(path, id, remoteId) {
  let sessionId = id;
  if (!id) {
    sessionId = uuidv4();
  }
  return {
    type: LOAD_PROTOCOL,
    protocolType: 'download',
    remoteId,
    path,
    sessionId,
  };
}

function loadFactoryProtocolAction(path) {
  return {
    type: LOAD_FACTORY_PROTOCOL,
    protocolType: 'factory',
    path,
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
        .map(protocolPath => importProtocolAction(protocolPath, action.remoteId))
        .catch(error => Observable.of(downloadProtocolFailed(error))),
    );

const importProtocolEpic = action$ =>
  action$.ofType(IMPORT_PROTOCOL)
    .switchMap(action =>
      Observable
        .fromPromise(importProtocol(action.path))
        .map(protocolFile => loadProtocolAction(protocolFile, null, action.remoteId))
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

const loadFactoryProtocolEpic = action$ =>
  action$.ofType(LOAD_FACTORY_PROTOCOL) // Filter for load protocol action
    .switchMap(action => // Favour subsequent load actions over earlier ones
      Observable
        .fromPromise(loadFactoryProtocol(action.path)) // Get protocol
        .map(response => setProtocol(action.path, response)) // Parse and save
        .catch(error => Observable.of(loadProtocolFailed(error))), //  ...or throw an error
    );

const actionCreators = {
  loadProtocol: loadProtocolAction,
  importProtocol: importProtocolAction,
  downloadProtocol: downloadProtocolAction,
  setProtocol,
  loadFactoryProtocol: loadFactoryProtocolAction,
  loadProtocolFailed,
  importProtocolFailed,
  downloadProtocolFailed,
};

const actionTypes = {
  IMPORT_PROTOCOL,
  IMPORT_PROTOCOL_FAILED,
  DOWNLOAD_PROTOCOL,
  DOWNLOAD_PROTOCOL_FAILED,
  LOAD_PROTOCOL,
  LOAD_PROTOCOL_FAILED,
  LOAD_FACTORY_PROTOCOL,
  SET_PROTOCOL,
};

const epics = combineEpics(
  downloadProtocolEpic,
  importProtocolEpic,
  loadProtocolEpic,
  loadFactoryProtocolEpic,
);

export {
  actionCreators,
  actionTypes,
  epics,
};
