/**
 * Import protocol utility with secure API support.
 */
import React from 'react';
import uuid from 'uuid';
import { CancellationError } from 'builder-util-runtime';
import { ProgressBar, Spinner } from '@codaco/ui';
import { store } from '../../ducks/store';
import { removeDirectory } from '../../utils/filesystem';
import { actionCreators as installedProtocolActions } from '../../ducks/modules/installedProtocols';
import downloadProtocol from '../../utils/protocol/downloadProtocol';
import extractProtocol from '../../utils/protocol/extractProtocol';
import parseProtocol from '../../utils/protocol/parseProtocol';
import checkExistingProtocol, { moveToExistingProtocol } from '../../utils/protocol/checkExistingProtocol';
import { actionCreators as toastActions } from '../../ducks/modules/toasts';
import protocolPath from '../../utils/protocol/protocolPath';
import { PROTOCOL_EXTENSION } from '../../config';
import { isCordova, isElectron } from '../../utils/Environment';

const cleanUpProtocol = async (uid) => {
  if (uid) {
    try {
      const cancelledDir = await protocolPath(uid);
      await removeDirectory(cancelledDir);
    } catch {
      // best effort
    }
  }
};

const cancelledImport = () => Promise.reject(new CancellationError('Import cancelled.'));

export const filenameFromURI = (uri) => decodeURIComponent(uri.split('/').pop().split('#')[0].split('?')[0]);

const filenameFromPath = (path) => path.split(/.*[/|\\]/)[1];

const protocolNameFromFilename = (filename) => filename.slice(0, -PROTOCOL_EXTENSION.length);

const catchError = (error) => Promise.reject(error);

const dispatch = store.dispatch;
const getState = store.getState;

const showCancellationToast = () => {
  dispatch(toastActions.addToast({
    type: 'warning',
    title: 'Import cancelled',
    content: (
      <React.Fragment>
        <p>You cancelled the import of this protocol.</p>
      </React.Fragment>
    ),
  }));
};

export const importProtocolFromURI = (uri) => {
  let cancelled = false;
  let protocolUid;
  let previousUid;
  const filename = filenameFromURI(uri);
  const protocolName = protocolNameFromFilename(filename);

  const toastUUID = uuid();

  dispatch(toastActions.addToast({
    id: toastUUID,
    type: 'info',
    title: 'Importing Protocol...',
    CustomIcon: (<Spinner small />),
    autoDismiss: false,
    dismissHandler: () => {
      showCancellationToast();
      cancelled = true;
    },
    content: (
      <React.Fragment>
        <ProgressBar orientation="horizontal" percentProgress={10} />
      </React.Fragment>
    ),
  }));

  const importPromise = new Promise((resolve) => {
    checkExistingProtocol(protocolName)
      .then((existingUid) => {
        previousUid = existingUid;

        dispatch(toastActions.updateToast(toastUUID, {
          title: 'Downloading Protocol...',
          content: (
            <React.Fragment>
              <ProgressBar orientation="horizontal" percentProgress={30} />
            </React.Fragment>
          ),
        }));
        return downloadProtocol(uri);
      })
      .then((tempLocation) => {
        if (cancelled) return cancelledImport();

        dispatch(toastActions.updateToast(toastUUID, {
          title: 'Extracting to temporary storage...',
          content: (
            <React.Fragment>
              <ProgressBar orientation="horizontal" percentProgress={40} />
            </React.Fragment>
          ),
        }));

        return extractProtocol(tempLocation);
      }, catchError)
      .then((protocolLocation) => {
        if (cancelled) return cancelledImport();

        protocolUid = protocolLocation;
        dispatch(toastActions.updateToast(toastUUID, {
          title: 'Validating protocol...',
          content: (
            <React.Fragment>
              <ProgressBar orientation="horizontal" percentProgress={80} />
            </React.Fragment>
          ),
        }));
        return parseProtocol(protocolLocation, protocolName);
      }, catchError)
      .then((protocolContent) => {
        if (cancelled) return cancelledImport();
        if (previousUid) {
          return moveToExistingProtocol(previousUid, protocolContent);
        }
        return protocolContent;
      })
      .then((protocolContent) => {
        if (cancelled) return cancelledImport();

        dispatch(installedProtocolActions.importProtocolCompleteAction(protocolContent));

        dispatch(toastActions.removeToast(toastUUID));
        dispatch(toastActions.addToast({
          type: 'success',
          title: 'Finished!',
          autoDismiss: true,
          content: (
            <React.Fragment>
              <p>Protocol installed successfully.</p>
            </React.Fragment>
          ),
        }));
        return resolve();
      }, catchError)
      .catch(
        (error) => {
          dispatch(toastActions.removeToast(toastUUID));

          if (protocolUid) cleanUpProtocol(protocolUid);

          if (!(error instanceof CancellationError)) {
            dispatch(installedProtocolActions.importProtocolFailedAction(error));
          }
        },
      );
  });

  importPromise.abort = () => {
    cancelled = true;
    if (protocolUid) cleanUpProtocol(protocolUid);
  };

  return importPromise;
};

export const beginLocalProtocolImport = () => {
  if (isElectron()) {
    // Use secure IPC API instead of window.require('electron')
    if (window.electronAPI?.ipc?.send) {
      window.electronAPI.ipc.send('OPEN_DIALOG');
    }
  }

  if (isCordova()) {
    window.chooser.getFile()
      .then((file) => {
        if (file && file.uri) {
          importProtocolFromFile(file.uri, file.name);
        }
      });
  }

  return Error('Environment not supported');
};

export const importProtocolFromFile = (filePath, name) => {
  let cancelled = false;
  let protocolUid;
  let previousUid;

  const filename = filenameFromPath(filePath);
  const protocolName = protocolNameFromFilename(name || filename);

  const toastUUID = uuid();

  dispatch(toastActions.addToast({
    id: toastUUID,
    type: 'info',
    title: 'Importing Protocol...',
    CustomIcon: (<Spinner small />),
    autoDismiss: false,
    dismissHandler: () => {
      showCancellationToast();
      cancelled = true;
    },
    content: (
      <React.Fragment>
        <ProgressBar orientation="horizontal" percentProgress={10} />
      </React.Fragment>
    ),
  }));

  return checkExistingProtocol(protocolName)
    .then((existingUid) => {
      previousUid = existingUid;
      dispatch(toastActions.updateToast(toastUUID, {
        title: 'Extracting to temporary storage...',
        content: (
          <React.Fragment>
            <ProgressBar orientation="horizontal" percentProgress={40} />
          </React.Fragment>
        ),
      }));
      return extractProtocol(filePath);
    })
    .then((protocolLocation) => {
      protocolUid = protocolLocation;
      if (cancelled) return cancelledImport(protocolLocation);

      dispatch(toastActions.updateToast(toastUUID, {
        title: 'Validating protocol...',
        content: (
          <React.Fragment>
            <ProgressBar orientation="horizontal" percentProgress={80} />
          </React.Fragment>
        ),
      }));
      return parseProtocol(protocolLocation, protocolName);
    }, catchError)
    .then((protocolContent) => {
      if (cancelled) return cancelledImport(protocolContent.uid);
      if (previousUid) {
        return moveToExistingProtocol(previousUid, protocolContent);
      }
      return protocolContent;
    })
    .then((protocolContent) => {
      if (cancelled) return cancelledImport(protocolContent.uid);
      dispatch(installedProtocolActions.importProtocolCompleteAction(protocolContent));

      dispatch(toastActions.removeToast(toastUUID));
      dispatch(toastActions.addToast({
        type: 'success',
        title: 'Finished!',
        autoDismiss: true,
        content: (
          <React.Fragment>
            <p>Protocol installed successfully.</p>
          </React.Fragment>
        ),
      }));
      return Promise.resolve();
    }, catchError)
    .catch(
      (error) => {
        dispatch(toastActions.removeToast(toastUUID));

        if (protocolUid) cleanUpProtocol(protocolUid);

        if (!(error instanceof CancellationError)) {
          dispatch(installedProtocolActions.importProtocolFailedAction(error));
        }
      },
    );
};
