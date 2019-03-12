import { actionTypes as SessionActionTypes } from './session';
import { supportedWorkers } from '../../utils/WorkerAgent';
import {
  downloadProtocol,
  extractProtocol,
  parseProtocol,
  preloadWorkers,
} from '../../utils/protocol';

const END_SESSION = SessionActionTypes.END_SESSION;

const DOWNLOAD_PROTOCOL = 'DOWNLOAD_PROTOCOL';
const DOWNLOAD_PROTOCOL_FAILED = Symbol('DOWNLOAD_PROTOCOL_FAILED');
const EXTRACT_PROTOCOL = 'EXTRACT_PROTOCOL';
const EXTRACT_PROTOCOL_FAILED = Symbol('EXTRACT_PROTOCOL_FAILED');
const PARSE_PROTOCOL = 'PARSE_PROTOCOL';
const PARSE_PROTOCOL_FAILED = Symbol('PARSE_PROTOCOL_FAILED');
const IMPORT_PROTOCOL_COMPLETE = 'IMPORT_PROTOCOL_COMPLETE';
const SET_WORKER_MAP = 'SET_WORKER_MAP';

export const initialState = {
  status: 'inactive',
  errorDetail: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case IMPORT_PROTOCOL_COMPLETE:
      return {
        ...state,
        status: 'complete',
      };
    case SET_WORKER_MAP:
      return {
        ...state,
        status: 'initialising-workers',
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
      };
    case PARSE_PROTOCOL:
      return {
        ...state,
        status: 'parsing',
      };
    case DOWNLOAD_PROTOCOL_FAILED:
    case EXTRACT_PROTOCOL_FAILED:
    case PARSE_PROTOCOL_FAILED:
      return {
        ...state,
        status: 'error',
        errorDetail: action.error,
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

function extractProtocolAction() {
  return {
    type: EXTRACT_PROTOCOL,
  };
}

function parseProtocolAction() {
  return {
    type: PARSE_PROTOCOL,
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
function setWorkerContentAction() {
  return {
    type: SET_WORKER_MAP,
  };
}

const downloadAndInstallProtocolThunk = (uri, pairedServer) => (dispatch) => {
  const protocolData = {};

  dispatch(downloadProtocolAction());
  // console.log('downloadAndInstallProtocol');
  return downloadProtocol(uri, pairedServer)
    .then(
      // Download succeeded, temp path returned.
      (temporaryProtocolPath) => {
        // console.log('downloadProtocol finished', temporaryProtocolPath);
        dispatch(extractProtocolAction());
        return extractProtocol(temporaryProtocolPath);
      },
    )
    .catch(error => dispatch(downloadProtocolFailedAction(error)))
    .then(
      // Extract succeeded, UID returned.
      (protocolUID) => {
        protocolData.UID = protocolUID;
        dispatch(parseProtocolAction());
        return parseProtocol(protocolUID);
      },
    )
    .catch(error => dispatch(extractProtocolFailedAction(error)))
    .then(
      (protocolContent) => {
        // Protocol data read, JSON returned.
        // { protocol, path }
        protocolData.protocolContent = protocolContent.protocol;
        protocolData.path = protocolContent.path;
        return preloadWorkers(protocolContent.path);
      },
    )
    .catch(error => dispatch(parseProtocolFailedAction(error)))
    .then(
      (workerUrls) => {
        console.log('workerUrls');
        const map = workerUrls.reduce((urlMap, workerUrl, i) => {
          if (workerUrl) {
            // eslint-disable-next-line no-param-reassign
            urlMap[supportedWorkers[i]] = workerUrl;
          }
          return urlMap;
        }, {});
        protocolData.workerUrlMap = map;
        return dispatch(setWorkerContentAction());
      },
    )
    .catch(error => console.log('worker stuff failed', error))
    .then(
      () => dispatch(importProtocolCompleteAction(protocolData)),
    );
};

const actionCreators = {
  downloadAndInstallProtocol: downloadAndInstallProtocolThunk,
  parseProtocol: parseProtocolAction,
  extractProtocol: extractProtocolAction,
  downloadProtocol: downloadProtocolAction,
  importProtocolComplete: importProtocolCompleteAction,
  parseProtocolFailedAction,
  setWorkerContentAction,
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
  SET_WORKER_MAP,
  IMPORT_PROTOCOL_COMPLETE,
};

export {
  actionCreators,
  actionTypes,
};
