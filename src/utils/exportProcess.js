import React from 'react';
import uuid from 'uuid';
import { ProgressBar, Scroller, Spinner, Icon } from '@codaco/ui';
import { store } from '../ducks/store';
import { actionCreators as toastActions, toastTypes } from '../ducks/modules/toasts';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';
import ApiClient from './ApiClient';
import FileExportManager from './network-exporters/src/FileExportManager';

const dispatch = store.dispatch;
const getState = store.getState;

const showCancellationToast = () => {
  dispatch(toastActions.addToast({
    type: toastTypes.warning,
    title: 'Export cancelled',
    content: (
      <React.Fragment>
        <p>You cancelled the export process.</p>
      </React.Fragment>
    ),
  }));
};

export const exportToFile = (sessionList) => {
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

  const errors = [];
  const toastUUID = uuid();

  const fileExportManager = new FileExportManager(exportOptions);

  fileExportManager.on('begin', () => {
    // Create a toast to show the status as it updates
    dispatch(toastActions.addToast({
      id: toastUUID,
      type: toastTypes.info,
      title: 'Exporting interviews...',
      CustomIcon: (<Spinner small />),
      autoDismiss: false,
      content: (
        <React.Fragment>
          <p>Starting export...</p>
          <ProgressBar orientation="horizontal" percentProgress={0} />
        </React.Fragment>
      ),
    }));
  });

  fileExportManager.on('update', ({ statusText, progress }) => {
    dispatch(toastActions.updateToast(toastUUID, {
      content: (
        <React.Fragment>
          <p>{statusText}</p>
          <ProgressBar orientation="horizontal" percentProgress={progress} />
        </React.Fragment>
      ),
    }));
  });

  fileExportManager.on('error', (error) => {
    errors.push(error);
    dispatch(toastActions.updateToast(toastUUID, {
      type: 'warning',
    }));
  });

  fileExportManager.on('finished', () => {
    dispatch(toastActions.removeToast(toastUUID));

    if (errors.length > 0) {
      const errorList = errors.map((error, index) => (<li key={index}><Icon name="warning" /> {error}</li>));

      dispatch(dialogActions.openDialog({
        type: 'Warning',
        title: 'Errors encountered during export',
        canCancel: false,
        message: (
          <React.Fragment>
            <p>
              Your export completed, but non-fatal errors were encountered during the process. This
              may mean that not all sessions or all formats were able to be exported.
              Review the details of these errors below, and ensure that you check the data you
              received.
            </p>
            <strong>Errors:</strong>
            <Scroller>
              <ul className="error-list">{errorList}</ul>
            </Scroller>
          </React.Fragment>
        ),
      }));

      return;
    }

    dispatch(toastActions.addToast({
      type: toastTypes.success,
      title: 'Export Complete!',
      autoDismiss: true,
      content: (
        <React.Fragment>
          <p>Your sessions were exported successfully.</p>
        </React.Fragment>
      ),
    }));
  });

  const exportPromise = fileExportManager.exportSessions(sessionList, installedProtocols);

  // Attatch the dismisshandler to the toast not that we have exportPromise defined.
  dispatch(toastActions.updateToast(toastUUID, {
    dismissHandler: () => {
      showCancellationToast();
      exportPromise.abort();
    },
  }));

  // Handle fatal export errors
  exportPromise.catch((error) => {
    // Close the progress toast
    dispatch(toastActions.removeToast(toastUUID));
    dispatch({
      type: 'SESSION_EXPORT_FATAL_ERROR',
      error,
    });

    exportPromise.abort();
  });

  return exportPromise;
};

export const exportToServer = (sessionList) => {
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
