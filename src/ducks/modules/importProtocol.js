import { CancellationError } from 'builder-util-runtime';

import { removeDirectory } from '../../utils/filesystem';
import downloadProtocol from '../../utils/protocol/downloadProtocol';
import extractProtocol from '../../utils/protocol/extractProtocol';
import parseProtocol from '../../utils/protocol/parseProtocol';
import checkExistingProtocol, { moveToExistingProtocol } from '../../utils/protocol/checkExistingProtocol';
import protocolPath from '../../utils/protocol/protocolPath';

const DOWNLOAD_PROTOCOL = 'DOWNLOAD_PROTOCOL';
const EXTRACT_PROTOCOL = 'EXTRACT_PROTOCOL';
const PARSE_PROTOCOL = 'PARSE_PROTOCOL';
const CHECK_EXISTING_PROTOCOL = 'CHECK_EXISTING_PROTOCOL';
const IMPORT_PROTOCOL_START = 'IMPORT_PROTOCOL_START';
const IMPORT_PROTOCOL_FAILED = 'IMPORT_PROTOCOL_FAILED';
const IMPORT_PROTOCOL_COMPLETE = 'IMPORT_PROTOCOL_COMPLETE';
const RESET_IMPORT = 'RESET_IMPORT';

export const initialState = {
  status: 'inactive',
  step: 0,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case IMPORT_PROTOCOL_FAILED:
    case RESET_IMPORT:
      return initialState;
    case CHECK_EXISTING_PROTOCOL:
      return {
        statusText: 'Checking for previous installation...',
        step: 1,
      };
    case IMPORT_PROTOCOL_START:
      return {
        statusText: 'Initializing protocol import...',
        step: 2,
      };
    case DOWNLOAD_PROTOCOL:
      return {
        statusText: 'Downloading protocol...',
        step: 3,
      };
    case EXTRACT_PROTOCOL:
      return {
        statusText: 'Extracting protocol to temporary storage...',
        step: 4,
      };
    case PARSE_PROTOCOL:
      return {
        statusText: 'Parsing and validating protocol...',
        step: 5,
      };
    case IMPORT_PROTOCOL_COMPLETE:
      return {
        statusText: 'Protocol imported successfully!',
        step: 6,
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

function checkExistingProtocolAction() {
  return {
    type: CHECK_EXISTING_PROTOCOL,
  };
}

function importProtocolStartAction() {
  return {
    type: IMPORT_PROTOCOL_START,
  };
}

function importProtocolFailedAction(error) {
  return {
    type: IMPORT_PROTOCOL_FAILED,
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

const cleanUpProtocol = (uid) => {
  if (uid) {
    const cancelledDir = protocolPath(uid);
    removeDirectory(cancelledDir)
      .catch(() => {}); // best effort
  }
};

const cancelledImport = () => Promise.reject(new CancellationError('Import cancelled.'));

const filenameFromURI = uri =>
  decodeURIComponent(uri.split('/').pop().split('#')[0].split('?')[0]);

const filenameFromPath = path => path.split(/.*[/|\\]/)[1];

const protocolNameFromFilename = (filename) => {
  const PROTOCOL_EXTENSION = '.netcanvas';
  return filename.slice(0, -PROTOCOL_EXTENSION.length);
};

const catchError = error => Promise.reject(error);

const importProtocolFromURI = (uri, usePairedServer) => (dispatch, getState) => {
  let pairedServer;
  let protocolUid;
  let previousUid;
  const filename = filenameFromURI(uri);
  const protocolName = protocolNameFromFilename(filename);

  if (usePairedServer) {
    pairedServer = getState().pairedServer;
  }

  dispatch(checkExistingProtocolAction());
  return checkExistingProtocol(dispatch, getState(), protocolName)
    .then((existingUid) => {
      previousUid = existingUid;
      dispatch(importProtocolStartAction());
      dispatch(downloadProtocolAction());
      return downloadProtocol(uri, pairedServer);
    })
    .then((tempLocation) => {
      if (getState().importProtocol.step === 0) return cancelledImport();
      dispatch(extractProtocolAction());
      return extractProtocol(tempLocation);
    }, catchError)
    .then((protocolLocation) => {
      protocolUid = protocolLocation;
      if (getState().importProtocol.step === 0) return cancelledImport();
      dispatch(parseProtocolAction());
      return parseProtocol(protocolLocation, protocolName);
    }, catchError)
    .then((protocolContent) => {
      if (getState().importProtocol.step === 0) return cancelledImport();
      if (previousUid) {
        return moveToExistingProtocol(previousUid, protocolContent);
      }
      return protocolContent;
    })
    .then((protocolContent) => {
      if (getState().importProtocol.step === 0) return cancelledImport();
      return dispatch(importProtocolCompleteAction(protocolContent));
    }, catchError)
    .catch(
      (error) => {
        if (protocolUid) cleanUpProtocol(protocolUid); // attempt to clean up files
        if (error instanceof CancellationError) {
          dispatch(resetImportAction());
        } else {
          dispatch(importProtocolFailedAction(error));
        }
      },
    );
};

const importProtocolFromFile = filePath => (dispatch, getState) => {
  let protocolUid;
  let previousUid;

  const filename = filenameFromPath(filePath);
  const protocolName = protocolNameFromFilename(filename);


  dispatch(checkExistingProtocolAction());
  return checkExistingProtocol(dispatch, getState(), protocolName)
    .then((existingUid) => {
      previousUid = existingUid;
      dispatch(importProtocolStartAction());
      dispatch(extractProtocolAction());
      return extractProtocol(filePath);
    })
    .then((protocolLocation) => {
      protocolUid = protocolLocation;
      if (getState().importProtocol.step === 0) return cancelledImport(protocolLocation);
      dispatch(parseProtocolAction());
      return parseProtocol(protocolLocation, protocolName);
    }, catchError)
    .then((protocolContent) => {
      if (getState().importProtocol.step === 0) return cancelledImport(protocolContent.uid);
      if (previousUid) {
        return moveToExistingProtocol(previousUid, protocolContent);
      }
      return protocolContent;
    })
    .then((protocolContent) => {
      if (getState().importProtocol.step === 0) return cancelledImport(protocolContent.uid);
      return dispatch(importProtocolCompleteAction(protocolContent));
    }, catchError)
    .catch(
      (error) => {
        if (protocolUid) cleanUpProtocol(protocolUid); // attempt to clean up files
        if (error instanceof CancellationError) {
          dispatch(resetImportAction());
        } else {
          dispatch(importProtocolFailedAction(error));
        }
      },
    );
};

const helpers = {
  filenameFromURI,
};

const actionCreators = {
  importProtocolFromURI,
  importProtocolFromFile,
  parseProtocol: parseProtocolAction,
  extractProtocol: extractProtocolAction,
  downloadProtocol: downloadProtocolAction,
  checkExistingProtocol: checkExistingProtocolAction,
  importProtocolStart: importProtocolStartAction,
  importProtocolComplete: importProtocolCompleteAction,
  importProtocolFailed: importProtocolFailedAction,
  resetImportProtocol: resetImportAction,
};

const actionTypes = {
  EXTRACT_PROTOCOL,
  DOWNLOAD_PROTOCOL,
  PARSE_PROTOCOL,
  CHECK_EXISTING_PROTOCOL,
  IMPORT_PROTOCOL_START,
  IMPORT_PROTOCOL_FAILED,
  IMPORT_PROTOCOL_COMPLETE,
  RESET_IMPORT,
};

export {
  actionCreators,
  actionTypes,
  helpers,
};
