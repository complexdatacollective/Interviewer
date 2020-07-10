import { sessionProperty, remoteProtocolProperty } from '../../utils/network-exporters/src/utils/reservedAttributes';
import ApiClient from '../../utils/ApiClient';
import FileExportManager from '../../utils/network-exporters/src/FileExportManager';

const SESSION_EXPORT_START = 'SESSION_EXPORT_START';
const SESSION_EXPORT_UPDATE = 'SESSION_EXPORT_UPDATE';
const SESSION_EXPORT_FINISH = 'SESSION_EXPORT_FINISH';
const SESSION_EXPORT_ERROR = 'SESSION_EXPORT_ERROR';


export const initialState = {
  statusText: null,
  progress: 0,
  errors: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SESSION_EXPORT_FINISH:
      return initialState;
    case SESSION_EXPORT_START:
      return {
        ...state,
        statusText: 'Starting export...',
        progress: 1,
      };
    case SESSION_EXPORT_UPDATE:
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
    default:
      return state;
  }
}

const sessionExportStart = () => ({
  type: SESSION_EXPORT_START,
});

const sessionExportFinish = () => ({
  type: SESSION_EXPORT_FINISH,
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

  let fileExportManager;

  // Instantiate file export manager and bind events
  try {
    fileExportManager = new FileExportManager(exportOptions);

    fileExportManager.on('begin', () => {
      dispatch(sessionExportStart());
    });

    fileExportManager.on('update', ({ statusText, progress }) => {
      dispatch(sessionExportUpdate(statusText, progress));
    });

    fileExportManager.on('error', (error) => {
      dispatch(sessionExportError(error));
    });

    fileExportManager.on('finished', () => {
      dispatch(sessionExportFinish());
    });

    fileExportManager.exportSessions(sessionList, installedProtocols);
  } catch (error) {
    dispatch(sessionExportError({ error }));
  }
};

const exportToServer = sessionList => (dispatch, getState) => {
  const pairedServer = getState().pairedServer;

  if (pairedServer) {
    const client = new ApiClient(pairedServer);
    let results = [];

    // Use reduce to create a promise sequence.
    return client.addTrustedCert().then(() => {
      dispatch(sessionExportStart(
        sessionList.map(session => (session.sessionVariables[sessionProperty])),
      ));

      return sessionList.reduce(
        (previousSession, nextSession) =>
          previousSession
            .then(
              () => client.exportSession(
                nextSession.sessionVariables[remoteProtocolProperty],
                nextSession.sessionUUID[sessionProperty],
                nextSession.sessionData,
              ).then((data) => {
                // return of session export
                dispatch(sessionExportSucceeded(nextSession.sessionUUID));

                results = [...results, {
                  sessionUUID: nextSession.sessionUUID,
                  response: data,
                }];
              }).catch((error) => {
                // session export failed...
                dispatch(sessionExportFailed(nextSession.sessionUUID, error));
                results = [...results, {
                  sessionUUID: nextSession.sessionUUID,
                  response: error,
                }];
              }),
            ), Promise.resolve(),
      );
    }).then(() => results);
  }
  return Promise.reject(new Error('No paired server available'));
};

const actionCreators = {
  sessionExportStart,
  sessionExportFinish,
  sessionExportUpdate,
  sessionExportError,
  exportToFile,
  exportToServer,
};

const actionTypes = {
  SESSION_EXPORT_START,
  SESSION_EXPORT_FINISH,
  SESSION_EXPORT_UPDATE,
  SESSION_EXPORT_ERROR,
};

export {
  actionCreators,
  actionTypes,
};
