import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { omit } from 'lodash';

import { actionTypes as SessionActionTypes } from './session';
import { supportedWorkers } from '../../utils/WorkerAgent';
import {
  loadProtocol,
  importProtocol,
  downloadProtocol,
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
const IMPORT_PROTOCOL_COMPLETE = 'IMPORT_PROTOCOL_COMPLETE';
const SET_WORKER = 'SET_WORKER';

export const initialState = {
  status: 'inactive',
  errorDetail: null,
  type: 'factory',
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case IMPORT_PROTOCOL_COMPLETE:
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

function loadProtocolFailedAction(error) {
  return {
    type: LOAD_PROTOCOL_FAILED,
    error,
  };
}

function importProtocolFailedAction(error) {
  return {
    type: IMPORT_PROTOCOL_FAILED,
    error,
  };
}

function downloadProtocolFailedAction(error) {
  return {
    type: DOWNLOAD_PROTOCOL_FAILED,
    error,
  };
}

function importProtocolCompleteAction(path, protocol) {
  return {
    type: IMPORT_PROTOCOL_COMPLETE,
    path,
    protocol,
  };
}

// If there's no custom worker, set to empty so we won't expect one later
function setWorkerContentAction(workerUrlMap = {}) {
  return {
    type: SET_WORKER,
    workerUrlMap,
  };
}

const downloadAndInstallProtocolThunk = (uri, pairedServer) => (dispatch) => {
  dispatch(downloadProtocolAction());
  // console.log('downloadAndInstallProtocol');
  return downloadProtocol(uri, pairedServer)
    .then(
      // Download succeeded, temp path returned.
      (protocolPath) => {
        // console.log('downloadProtocol finished', protocolPath);
        dispatch(importProtocolAction());
        return importProtocol(protocolPath);
      },
    )
    .catch(error => dispatch(downloadProtocolFailedAction(error)))
    .then(
      // Extract succeeded, app data path returned.
      (appPath) => {
        // console.log('import protocol finished', appPath);
        dispatch(loadProtocolAction());
        return loadProtocol(appPath);
      },
    )
    .catch(error => dispatch(importProtocolFailedAction(error)))
    .then(
      (protocolData) => {
        // Protocol data read, JSON returned.
        // console.log('load protocol JSON finished', protocolData);
        dispatch(importProtocolCompleteAction(protocolData));
      },
    )
    .catch(error => dispatch(loadProtocolFailedAction(error)));
};

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
        .map(workerUrlMap => setWorkerContentAction(workerUrlMap)),
    );

const actionCreators = {
  downloadAndInstallProtocol: downloadAndInstallProtocolThunk,
  loadProtocol: loadProtocolAction,
  importProtocol: importProtocolAction,
  downloadProtocol: downloadProtocolAction,
  importProtocolComplete: importProtocolCompleteAction,
  loadFactoryProtocol: loadFactoryProtocolAction,
  loadProtocolFailedAction,
  importProtocolFailedAction,
  downloadProtocolFailedAction,
};

const actionTypes = {
  IMPORT_PROTOCOL,
  IMPORT_PROTOCOL_FAILED,
  DOWNLOAD_PROTOCOL,
  DOWNLOAD_PROTOCOL_FAILED,
  LOAD_PROTOCOL,
  LOAD_PROTOCOL_FAILED,
  IMPORT_PROTOCOL_COMPLETE,
};

const epics = combineEpics(
  loadProtocolWorkerEpic,
);

export {
  actionCreators,
  actionTypes,
  epics,
};
