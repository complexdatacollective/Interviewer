import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { omit } from 'lodash';

import { actionTypes as SessionActionTypes } from './session';
import { supportedWorkers } from '../../utils/WorkerAgent';
import {
  loadProtocol,
  importProtocol,
  downloadProtocol,
  loadFactoryProtocol,
  preloadWorkers,
} from '../../utils/protocol';

/**
 * `protocol` maintains information about the currently-loaded protocol for session, and
 * provides actions for downloading, importing, etc. It does a reference to data in `./protocols`.
 *
 * Typical action flow:
 *
 * 1. Download: Fetch a remote .netcanvas file from network, save to tmp dir
 * 2. Import: extract .netcanvas contents & move files to user data dir
 * 3. Load: Read & parse protocol.json from imported files
 * 4. Set Protocol: store parsed protocol JSON in state
 *   - Side effect: if this is a new protocol, persist data & metadata (see ./protocols)
 *
 * Notes:
 * - As a side effect of END_SESSION, clear out the current protocol contents here
 * - Typically, an interface will call addSession() to begin a new session before a protocol
 *   is loaded; loading state is maintained here.
 */

const END_SESSION = SessionActionTypes.END_SESSION;

const DOWNLOAD_PROTOCOL = 'PROTOCOL/DOWNLOAD_PROTOCOL';
const DOWNLOAD_PROTOCOL_FAILED = Symbol('PROTOCOL/DOWNLOAD_PROTOCOL_FAILED');
const IMPORT_PROTOCOL = 'PROTOCOL/IMPORT_PROTOCOL';
const IMPORT_PROTOCOL_FAILED = Symbol('PROTOCOL/IMPORT_PROTOCOL_FAILED');
const LOAD_PROTOCOL = 'LOAD_PROTOCOL';
const LOAD_PROTOCOL_FAILED = Symbol('LOAD_PROTOCOL_FAILED');
const SET_PROTOCOL = 'SET_PROTOCOL';
const SET_WORKER = 'SET_WORKER';

export const initialState = {
  isLoaded: false,
  isLoading: false,
  error: null,
  name: '',
  version: '',
  required: '',
  stages: [],
  type: 'factory',
  workerUrlMap: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PROTOCOL:
      return {
        ...state,
        ...omit(action.protocol, 'externalData'),
        path: action.path,
        isLoaded: true,
        isLoading: false,
      };
    case SET_WORKER:
      return {
        ...state,
        workerUrlMap: action.workerUrlMap,
      };
    case END_SESSION:
      return initialState;
    case DOWNLOAD_PROTOCOL:
    case IMPORT_PROTOCOL:
      return {
        ...state,
        isLoaded: false,
        isLoading: true,
      };
    case LOAD_PROTOCOL:
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

function downloadProtocolAction(uri, forNCServer) {
  return {
    type: DOWNLOAD_PROTOCOL,
    uri,
    forNCServer,
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
    protocolType: 'download',
    path,
  };
}

function loadFactoryProtocolAction(path) {
  return {
    type: LOAD_PROTOCOL,
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

function setProtocol(path, protocol, isFactoryProtocol) {
  return {
    type: SET_PROTOCOL,
    path,
    protocol,
    isFactoryProtocol,
  };
}

// If there's no custom worker, set to empty so we won't expect one later
function setWorkerContent(workerUrlMap = {}) {
  return {
    type: SET_WORKER,
    workerUrlMap,
  };
}

const downloadProtocolEpic = action$ =>
  action$.ofType(DOWNLOAD_PROTOCOL)
    .switchMap(action =>
      Observable
        .fromPromise(downloadProtocol(action.uri, action.forNCServer))
        .map(protocolPath => importProtocolAction(protocolPath))
        .catch(error => Observable.of(downloadProtocolFailed(error))),
    );

const importProtocolEpic = action$ =>
  action$.ofType(IMPORT_PROTOCOL)
    .switchMap(action =>
      Observable
        .fromPromise(importProtocol(action.path))
        .map(protocolFile => loadProtocolAction(protocolFile, null))
        .catch(error => Observable.of(importProtocolFailed(error))),
    );

const loadProtocolEpic = action$ =>
  action$
    .filter(action => action.type === LOAD_PROTOCOL && action.protocolType !== 'factory')
    .switchMap(action => // Favour subsequent load actions over earlier ones
      Observable
        .fromPromise(loadProtocol(action.path)) // Get protocol
        .map(response => setProtocol(action.path, response, false)) // Parse and save
        .catch(error => Observable.of(loadProtocolFailed(error))), //  ...or throw an error
    );

const loadFactoryProtocolEpic = action$ =>
  action$
    .filter(action => action.type === LOAD_PROTOCOL && action.protocolType === 'factory')
    .switchMap(action => // Favour subsequent load actions over earlier ones
      Observable
        .fromPromise(loadFactoryProtocol(action.path)) // Get protocol
        .map(response => setProtocol(action.path, response, true)) // Parse and save
        .catch(error => Observable.of(loadProtocolFailed(error))), //  ...or throw an error
    );

const loadProtocolWorkerEpic = action$ =>
  action$
    .ofType(LOAD_PROTOCOL)
    .switchMap(action => // Favour subsequent load actions over earlier ones
      Observable
        .fromPromise(preloadWorkers(action.path, action.protocolType === 'factory'))
        .mergeMap(urls => urls)
        .reduce((urlMap, workerUrl, i) => {
          if (workerUrl) {
            // eslint-disable-next-line no-param-reassign
            urlMap[supportedWorkers[i]] = workerUrl;
          }
          return urlMap;
        }, {})
        .map(workerUrlMap => setWorkerContent(workerUrlMap)),
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
  SET_PROTOCOL,
};

const epics = combineEpics(
  downloadProtocolEpic,
  importProtocolEpic,
  loadProtocolEpic,
  loadFactoryProtocolEpic,
  loadProtocolWorkerEpic,
);

export {
  actionCreators,
  actionTypes,
  epics,
};
