import React from 'react';
import { Icon } from '@codaco/ui';
import { batch } from 'react-redux';
import { store } from '../ducks/store';
import { actionCreators as toastActions } from '../ducks/modules/toasts';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';
import { actionCreators as exportProgressActions } from '../ducks/modules/exportProgress';
import { withErrorDialog } from '../ducks/modules/errors';
import { getRemoteProtocolID } from './networkFormat';

const { dispatch } = store;
const { getState } = store;

const setInitialExportStatus = () => {
  dispatch(exportProgressActions.update({
    statusText: 'Starting export...',
    percentProgress: 0,
  }));
};

const showCancellationToast = () => {
  dispatch(toastActions.addToast({
    type: 'warning',
    title: 'Export cancelled',
    content: (
      <>
        <p>You cancelled the export process.</p>
      </>
    ),
  }));
};

const fatalExportErrorAction = withErrorDialog((error) => ({
  type: 'SESSION_EXPORT_FATAL_ERROR',
  error,
}));

export const exportToFile = (sessionList, filename) => {
  // Reset exportProgress state
  dispatch(exportProgressActions.reset());

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
      exportFilename: filename,
      unifyNetworks,
      useScreenLayoutCoordinates,
      screenLayoutHeight,
      screenLayoutWidth,
    },
  };

  const errors = [];
  const succeeded = [];

  // Store cleanup functions for IPC listeners
  const cleanupListeners = [];

  const cleanup = () => {
    cleanupListeners.forEach((fn) => fn());
    cleanupListeners.length = 0;
  };

  // Set up IPC event listeners
  cleanupListeners.push(window.electronAPI.export.onBegin(() => {
    setInitialExportStatus();
  }));

  cleanupListeners.push(window.electronAPI.export.onUpdate(({ statusText, progress }) => {
    dispatch(exportProgressActions.update({
      statusText,
      percentProgress: progress,
    }));
  }));

  cleanupListeners.push(window.electronAPI.export.onCancelled(() => {
    dispatch(exportProgressActions.reset());
    showCancellationToast();
    cleanup();
  }));

  cleanupListeners.push(window.electronAPI.export.onSessionExported((sessionId) => {
    if (!sessionId || typeof sessionId !== 'string') {
      // eslint-disable-next-line no-console
      console.warn('session-exported event did not contain a sessionID');
      return;
    }
    succeeded.push(sessionId);
  }));

  cleanupListeners.push(window.electronAPI.export.onError((error) => {
    errors.push(error);
  }));

  cleanupListeners.push(window.electronAPI.export.onFinished(() => {
    dispatch(exportProgressActions.reset());

    if (succeeded.length > 0) {
      batch(() => {
        succeeded.forEach(
          (successfulExport) => dispatch(sessionsActions.setSessionExported(successfulExport)),
        );
      });
    }

    if (errors.length > 0) {
      const errorList = errors.map((error, index) => (
        <li key={index}>
          <Icon name="warning" />
          {' '}
          {error}
        </li>
      ));

      dispatch(dialogActions.openDialog({
        type: 'Warning',
        title: 'Errors encountered during export',
        canCancel: false,
        message: (
          <>
            <p>
              Your export completed, but non-fatal errors were encountered during the process. This
              may mean that not all sessions or all formats were able to be exported.
              Review the details of these errors below, and ensure that you check the data you
              received. Contact the Network Canvas team for support.
            </p>
            <strong>Errors:</strong>
            <ul className="export-error-list">{errorList}</ul>
          </>
        ),
      }));

      cleanup();
      return;
    }

    dispatch(toastActions.addToast({
      type: 'success',
      title: 'Export Complete!',
      autoDismiss: true,
      content: (
        <>
          <p>Your sessions were exported successfully.</p>
        </>
      ),
    }));

    cleanup();
  }));

  // The protocol object needs to be reformatted so that it is keyed by
  // the sha of protocol.name, since this is what Server and network-exporters
  // use.
  const buildReformattedProtocols = async () => {
    const protocols = Object.values(installedProtocols);
    const entries = await Promise.all(
      protocols.map(async (protocol) => [await getRemoteProtocolID(protocol.name), protocol]),
    );
    return Object.fromEntries(entries);
  };

  // Start export via IPC to main process
  return buildReformattedProtocols().then((reformatedProtocols) => (
    window.electronAPI.export.start({
      sessions: sessionList,
      protocols: reformatedProtocols,
      exportOptions,
    })
  )).then((result) => {
    if (!result.success) {
      dispatch(fatalExportErrorAction(new Error(result.error)));
      cleanup();
    }
    return result;
  }).catch((error) => {
    dispatch(fatalExportErrorAction(error));
    cleanup();
    throw error;
  });
};

