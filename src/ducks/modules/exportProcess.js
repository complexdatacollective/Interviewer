import ApiClient from '../../utils/ApiClient';
import FileExportManager from '../../utils/network-exporters/src/FileExportManager';

const SESSION_EXPORT_RESET = 'SESSION_EXPORT_RESET';
const SESSION_EXPORT_START = 'SESSION_EXPORT_START';
const SESSION_EXPORT_UPDATE = 'SESSION_EXPORT_UPDATE';
const SESSION_EXPORT_FINISH = 'SESSION_EXPORT_FINISH';
const SESSION_EXPORT_ERROR = 'SESSION_EXPORT_ERROR';
const SESSION_EXPORT_FATAL_ERROR = 'SESSION_EXPORT_FATAL_ERROR';


export const initialState = {
  statusText: null,
  progress: 0,
  errors: [],
  fatalError: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SESSION_EXPORT_RESET:
      return initialState;
    case SESSION_EXPORT_START:
      return {
        ...state,
        statusText: 'Starting export...',
        progress: 1,
      };
    case SESSION_EXPORT_UPDATE:
    case SESSION_EXPORT_FINISH:
      return {
        ...state,
        statusText: action.statusText,
        progress: action.progress,
      };
    case SESSION_EXPORT_ERROR:
      return {
        ...state,
        errors: [
          ...state.errors,
          action.error,
        ],
      };
    case SESSION_EXPORT_FATAL_ERROR:
      return {
        ...state,
        fatalError: action.error,
      };
    default:
      return state;
  }
}

const sessionExportReset = () => ({
  type: SESSION_EXPORT_RESET,
});

const sessionExportStart = () => ({
  type: SESSION_EXPORT_START,
});

const sessionExportFinish = (statusText, progress) => ({
  type: SESSION_EXPORT_FINISH,
  statusText,
  progress,
});

const sessionExportUpdate = (statusText, progress) => ({
  type: SESSION_EXPORT_UPDATE,
  statusText,
  progress,
});

const sessionExportError = error => ({
  type: SESSION_EXPORT_ERROR,
  error,
});

const sessionExportFatalError = error => ({
  type: SESSION_EXPORT_FATAL_ERROR,
  error,
});

const exportToFile = sessionList => (dispatch, getState) => {
  const {
    installedProtocols,
    deviceSettings: {
      exportGraphML,
      exportCSV,
      unifyNetworks,
      useScreenLayoutCoordinates,
      screenLayoutHeight,
      screenLayoutWidth,
    },
  } = getState();

  const exportOptions = {
    exportGraphML,
    exportCSV,
    globalOptions: {
      unifyNetworks,
      useScreenLayoutCoordinates,
      screenLayoutHeight,
      screenLayoutWidth,
    },
  };

  const fileExportManager = new FileExportManager(exportOptions);

  fileExportManager.on('begin', () => {
    dispatch(sessionExportStart());
  });

  fileExportManager.on('update', ({ statusText, progress }) => {
    dispatch(sessionExportUpdate(statusText, progress));
  });

  fileExportManager.on('error', (error) => {
    dispatch(sessionExportError(error));
  });

  fileExportManager.on('finished', ({ statusText, progress }) => {
    dispatch(sessionExportFinish(statusText, progress));
  });

  const exportPromise = fileExportManager.exportSessions(sessionList, installedProtocols);
  exportPromise.catch((error) => {
    dispatch(sessionExportFatalError(error));
  });

  return exportPromise;
};

const exportToServer = sessionList => (dispatch, getState) => {
  const pairedServer = getState().pairedServer;

  const client = new ApiClient(pairedServer);
  client.addTrustedCert();

  client.on('begin', () => {
    dispatch(sessionExportStart());
  });

  client.on('update', ({ statusText, progress }) => {
    dispatch(sessionExportUpdate(statusText, progress));
  });

  client.on('error', (error) => {
    dispatch(sessionExportError(error));
  });

  client.on('finished', ({ statusText, progress }) => {
    dispatch(sessionExportFinish(statusText, progress));
  });

  const exportPromise = client.exportSessions(sessionList);
  exportPromise.catch((error) => {
    dispatch(sessionExportFatalError(error));
  });

  return exportPromise;
};

const actionCreators = {
  sessionExportReset,
  sessionExportStart,
  sessionExportFinish,
  sessionExportUpdate,
  sessionExportError,
  sessionExportFatalError,
  exportToFile,
  exportToServer,
};

const actionTypes = {
  SESSION_EXPORT_START,
  SESSION_EXPORT_FINISH,
  SESSION_EXPORT_UPDATE,
  SESSION_EXPORT_ERROR,
  SESSION_EXPORT_FATAL_ERROR,
};

export {
  actionCreators,
  actionTypes,
};
