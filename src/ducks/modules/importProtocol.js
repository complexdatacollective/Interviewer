import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';

import { actionTypes as SessionActionTypes } from './session';
import { supportedWorkers } from '../../utils/WorkerAgent';
import {
  downloadProtocol,
  extractProtocol,
  parseProtocol,
  preloadWorkers,
} from '../../utils/protocol';

const END_SESSION = SessionActionTypes.END_SESSION;

const DOWNLOAD_PROTOCOL = 'PROTOCOL/DOWNLOAD_PROTOCOL';
const DOWNLOAD_PROTOCOL_FAILED = Symbol('PROTOCOL/DOWNLOAD_PROTOCOL_FAILED');
const EXTRACT_PROTOCOL = 'PROTOCOL/EXTRACT_PROTOCOL';
const EXTRACT_PROTOCOL_FAILED = Symbol('PROTOCOL/EXTRACT_PROTOCOL_FAILED');
const PARSE_PROTOCOL = 'PARSE_PROTOCOL';
const PARSE_PROTOCOL_FAILED = Symbol('PARSE_PROTOCOL_FAILED');
const IMPORT_PROTOCOL_COMPLETE = 'IMPORT_PROTOCOL_COMPLETE';
const SET_WORKER = 'SET_WORKER';

export const initialState = {
  status: 'inactive',
  errorDetail: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case IMPORT_PROTOCOL_COMPLETE:
      return {
        ...state,
        ...action.protocolData.protocol,
        status: 'complete',
      };
    case SET_WORKER:
      return {
        ...state,
        workerUrlMap: action.workerUrlMap,
      };
    case END_SESSION:
      return initialState;
    case DOWNLOAD_PROTOCOL:
      return {
        ...state,
        status: 'downloading',
      };
    case EXTRACT_PROTOCOL:
      return {
        ...state,
        status: 'extracting',
        path: action.path,
      };
    case PARSE_PROTOCOL:
      return {
        ...state,
        status: 'parsing',
        path: action.path,
      };
    case DOWNLOAD_PROTOCOL_FAILED:
    case EXTRACT_PROTOCOL_FAILED:
    case PARSE_PROTOCOL_FAILED:
      return {
        ...state,
        status: 'error',
      };
    default:
      return state;
  }
}

function downloadProtocolAction() {
  return {
    type: DOWNLOAD_PROTOCOL,
  };
}

function extractProtocolAction(tempPath) {
  return {
    type: EXTRACT_PROTOCOL,
    path: tempPath,
  };
}

function parseProtocolAction(path) {
  return {
    type: PARSE_PROTOCOL,
    path,
  };
}

function parseProtocolFailedAction(error) {
  return {
    type: PARSE_PROTOCOL_FAILED,
    error,
  };
}

function extractProtocolFailedAction(error) {
  return {
    type: EXTRACT_PROTOCOL_FAILED,
    error,
  };
}

function downloadProtocolFailedAction(error) {
  return {
    type: DOWNLOAD_PROTOCOL_FAILED,
    error,
  };
}

function importProtocolCompleteAction(protocolData) {
  return {
    type: IMPORT_PROTOCOL_COMPLETE,
    protocolData,
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
        dispatch(extractProtocolAction());
        return extractProtocol(protocolPath);
      },
    )
    .catch(error => dispatch(downloadProtocolFailedAction(error)))
    .then(
      // Extract succeeded, app data path returned.
      (appPath) => {
        // console.log('import protocol finished', appPath);
        dispatch(parseProtocolAction(appPath));
        return parseProtocol(appPath);
      },
    )
    .catch(error => dispatch(extractProtocolFailedAction(error)))
    .then(
      (protocolData) => {
        // Protocol data read, JSON returned.
        // console.log('load protocol JSON finished', protocolData);
        dispatch(importProtocolCompleteAction(protocolData));
      },
    )
    .catch(error => dispatch(parseProtocolFailedAction(error)));
};

const loadProtocolWorkerEpic = action$ =>
  action$
    .ofType(PARSE_PROTOCOL)
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
  parseProtocol: parseProtocolAction,
  extractProtocol: extractProtocolAction,
  downloadProtocol: downloadProtocolAction,
  importProtocolComplete: importProtocolCompleteAction,
  parseProtocolFailedAction,
  extractProtocolFailedAction,
  downloadProtocolFailedAction,
};

const actionTypes = {
  EXTRACT_PROTOCOL,
  EXTRACT_PROTOCOL_FAILED,
  DOWNLOAD_PROTOCOL,
  DOWNLOAD_PROTOCOL_FAILED,
  PARSE_PROTOCOL,
  PARSE_PROTOCOL_FAILED,
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