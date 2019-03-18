import {
  downloadProtocol,
  extractProtocol,
  parseProtocol,
} from '../../utils/protocol';
import { store } from '../../ducks/store';

const DOWNLOAD_PROTOCOL = 'DOWNLOAD_PROTOCOL';
const DOWNLOAD_PROTOCOL_FAILED = Symbol('DOWNLOAD_PROTOCOL_FAILED');
const EXTRACT_PROTOCOL = 'EXTRACT_PROTOCOL';
const EXTRACT_PROTOCOL_FAILED = Symbol('EXTRACT_PROTOCOL_FAILED');
const PARSE_PROTOCOL = 'PARSE_PROTOCOL';
const PARSE_PROTOCOL_FAILED = Symbol('PARSE_PROTOCOL_FAILED');
const IMPORT_PROTOCOL_COMPLETE = 'IMPORT_PROTOCOL_COMPLETE';
const RESET_IMPORT = 'RESET_IMPORT';

export const initialState = {
  status: 'inactive',
  errorDetail: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case IMPORT_PROTOCOL_COMPLETE:
    case RESET_IMPORT:
      return initialState;
    case DOWNLOAD_PROTOCOL:
      return {
        status: 'downloading',
      };
    case EXTRACT_PROTOCOL:
      return {
        status: 'extracting',
      };
    case PARSE_PROTOCOL:
      return {
        status: 'parsing',
      };
    case DOWNLOAD_PROTOCOL_FAILED:
    case EXTRACT_PROTOCOL_FAILED:
    case PARSE_PROTOCOL_FAILED:
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

function resetImportAction() {
  return {
    type: RESET_IMPORT,
  };
}

const downloadAndInstallProtocolThunk = (uri, usePairedServer) => (dispatch) => {
  const protocolData = {};

  dispatch(downloadProtocolAction());
  let pairedServer;

  if (usePairedServer) {
    pairedServer = store.getState().pairedServer;
  }

  return downloadProtocol(uri, pairedServer)
    .then(
      // Download succeeded, temp path returned.
      (temporaryProtocolPath) => {
        // console.log('downloadProtocol finished', temporaryProtocolPath);
        dispatch(extractProtocolAction());
        return extractProtocol(temporaryProtocolPath);
      },
    )
    .catch(
      (error) => {
        if (error) {
          dispatch(downloadProtocolFailedAction(error));
        }
      },
    )
    .then(
      // Extract succeeded, UID returned.
      (protocolUID) => {
        if (!protocolUID) {
          return Promise.reject();
        }
        protocolData.UID = protocolUID;
        dispatch(parseProtocolAction());
        return parseProtocol(protocolUID);
      },
    )
    .catch(
      (error) => {
        if (error) {
          dispatch(extractProtocolFailedAction(error));
        }
      },
    )
    .then(
      (protocolContent) => {
        protocolData.protocolContent = protocolContent.protocol;
        protocolData.path = protocolContent.path;
        return dispatch(importProtocolCompleteAction(protocolData));
      },
    )
    .catch(
      (error) => {
        if (error) {
          console.warn('Import protocol failed.');
        }
      },
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
  resetImportProtocol: resetImportAction,
};

const actionTypes = {
  EXTRACT_PROTOCOL,
  EXTRACT_PROTOCOL_FAILED,
  DOWNLOAD_PROTOCOL,
  DOWNLOAD_PROTOCOL_FAILED,
  PARSE_PROTOCOL,
  PARSE_PROTOCOL_FAILED,
  IMPORT_PROTOCOL_COMPLETE,
  RESET_IMPORT,
};

export {
  actionCreators,
  actionTypes,
};
