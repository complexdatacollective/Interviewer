import React from 'react';
import uuid from 'uuid';
import { ProgressBar, Spinner, Icon } from '@codaco/ui';
import { store } from '../ducks/store';
import { actionCreators as toastActions, toastTypes } from '../ducks/modules/toasts';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';
import ApiClient from './ApiClient';
import FileExportManager from './network-exporters/src/FileExportManager';

const dispatch = store.dispatch;
const getState = store.getState;

const showExportBeginToast = (id) => {
  dispatch(toastActions.addToast({
    id,
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
};

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
    showExportBeginToast(toastUUID);
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
    // If this is the first error, update the toast type to 'warning'
    if (errors.length === 0) {
      dispatch(toastActions.updateToast(toastUUID, {
        type: 'warning',
      }));
    }

    errors.push(error);
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
            <ul className="export-error-list">{errorList}</ul>
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
  const toastUUID = uuid();
  const errors = [];

  const pairedServer = getState().pairedServer;

  const client = new ApiClient(pairedServer);
  client.addTrustedCert();

  client.on('begin', () => {
    showExportBeginToast(toastUUID);
  });

  client.on('update', ({ statusText, progress }) => {
    dispatch(toastActions.updateToast(toastUUID, {
      content: (
        <React.Fragment>
          <p>{statusText}</p>
          <ProgressBar orientation="horizontal" percentProgress={progress} />
        </React.Fragment>
      ),
    }));
  });

  client.on('session-exported', sessionId => {
    console.log('got session-exported', sessionId);
    dispatch(sessionsActions.setSessionExported(sessionId));
  });


  client.on('error', (error) => {
    // If this is the first error, update the toast type to 'warning'
    if (errors.length === 0) {
      dispatch(toastActions.updateToast(toastUUID, {
        type: 'warning',
      }));
    }
    console.log('error', error);
    errors.push(error);
  });

  client.on('finished', () => {
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
              may mean that not all sessions were transferred to Server.
              Review the details of these errors below, and ensure that you check the data you
              received.
            </p>
            <strong>Errors:</strong>
            <ul className="export-error-list">{errorList}</ul>
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

  const exportPromise = client.exportSessions(sessionList);

  // Attatch the dismisshandler to the toast not that we have exportPromise defined.
  dispatch(toastActions.updateToast(toastUUID, {
    dismissHandler: () => {
      showCancellationToast();
      exportPromise.abort();
    },
  }));

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
