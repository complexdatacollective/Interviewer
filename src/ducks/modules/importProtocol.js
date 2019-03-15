import { actionTypes as SessionActionTypes } from './session';
import {
  downloadProtocol,
  extractProtocol,
  parseProtocol,
} from '../../utils/protocol';
import { store } from '../../ducks/store';

const END_SESSION = SessionActionTypes.END_SESSION;

const DOWNLOAD_PROTOCOL = 'DOWNLOAD_PROTOCOL';
const DOWNLOAD_PROTOCOL_FAILED = Symbol('DOWNLOAD_PROTOCOL_FAILED');
const EXTRACT_PROTOCOL = 'EXTRACT_PROTOCOL';
const EXTRACT_PROTOCOL_FAILED = Symbol('EXTRACT_PROTOCOL_FAILED');
const PARSE_PROTOCOL = 'PARSE_PROTOCOL';
const PARSE_PROTOCOL_FAILED = Symbol('PARSE_PROTOCOL_FAILED');
const IMPORT_PROTOCOL_COMPLETE = 'IMPORT_PROTOCOL_COMPLETE';
const SET_WORKER_MAP = 'SET_WORKER_MAP';
const SET_WORKER_MAP_FAILED = 'SET_WORKER_MAP_FAILED';

export const initialState = {
  status: 'inactive',
  errorDetail: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case IMPORT_PROTOCOL_COMPLETE:
      return initialState;
    case SET_WORKER_MAP:
      return {
        ...state,
        status: 'initialising-workers',
      };
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
    case SET_WORKER_MAP_FAILED:
      return {
        ...state,
        status: 'error',
        errorDetail: action.error,
      };
    case END_SESSION:
      return initialState;
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

const downloadAndInstallProtocolThunk = (uri, usePairedServer) => (dispatch) => {
  const protocolData = {};

  dispatch(downloadProtocolAction());
  let pairedServer;

  if (usePairedServer) {
    pairedServer = store.getState().pairedServer;
    console.log('Using paired server for download:', pairedServer);
  }

  return downloadProtocol(uri, pairedServer)
    .then(
      // Download succeeded, temp path returned.
      (temporaryProtocolPath) => {
        if (!temporaryProtocolPath) {
          return Promise.reject('No temporary protocol path.');
        }
        // console.log('downloadProtocol finished', temporaryProtocolPath);
        dispatch(extractProtocolAction());
        return extractProtocol(temporaryProtocolPath);
      },
      error => dispatch(downloadProtocolFailedAction(error)),
    )
    .then(
      // Extract succeeded, UID returned.
      (protocolUID) => {
        if (!protocolUID) {
          return Promise.reject('No protocol UID.');
        }

        protocolData.UID = protocolUID;
        dispatch(parseProtocolAction());

        return parseProtocol(protocolUID);
      },
      error => dispatch(extractProtocolFailedAction(error)),
    )
    .then(
      (protocolContent) => {
        if (!protocolContent) {
          return Promise.reject('No protocol content.');
        }

        protocolData.protocolContent = protocolContent.protocol;
        protocolData.path = protocolContent.path;
        return dispatch(importProtocolCompleteAction(protocolData));
      },
      error => dispatch(parseProtocolFailedAction(error)),
    );
};

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

export {
  actionCreators,
  actionTypes,
};
