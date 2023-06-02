import React from 'react';
import uuid from 'uuid';
import { ProgressBar } from '@codaco/ui';
import { store } from '~/ducks/store';
import { actionCreators as installedProtocolActions } from '~/ducks/modules/installedProtocols';
import { actionCreators as toastActions } from '~/ducks/modules/toasts';
import { isElectron } from '~/utils/Environment';
import { showImportCompleteToast, showStartImportToast } from './shared/toasts';
import { CapacitorImportManager } from './capacitor/ImportManager';
import { ElectronImportManager } from './electron/ImportManager';

const dispatch = store.dispatch;

const importManager = window.Capacitor && Capacitor.isNativePlatform() ? new CapacitorImportManager() : new ElectronImportManager();

export default async function importProtocol(uri = null) {
  const updateToastUUID = uuid();

  const handleAbort = () => {
    importManager.abort();
    showCancellationToast();
  };

  importManager.once('start', () => showStartImportToast(updateToastUUID, handleAbort));

  importManager.on('complete', (protocolJson) => {
    dispatch(toastActions.removeToast(updateToastUUID));
    dispatch(installedProtocolActions.importProtocolCompleteAction(protocolJson));
    showImportCompleteToast();
  });

  importManager.on('error', (error) => {
    console.error('Error importing protocol', error);
    dispatch(toastActions.removeToast(updateToastUUID));
    showImportFailedToast();
  });

  importManager.on('update', ({ title, progress }) => {
    dispatch(toastActions.updateToast(updateToastUUID, {
      title,
      content: (
        <React.Fragment>
          <ProgressBar orientation="horizontal" percentProgress={progress} />
        </React.Fragment>
      ),
    }));
  });

  try {
    if (uri) {
      await importManager.importFromURI(uri);
    } else {
      await importManager.importFromFile();
    }
  } catch (error) {
    console.log('todo: error handling', error);
    // if (error instanceof CancellationError) {
    //   showCancellationToast();
    // } else {
    //   console.error(error);
    // }
  }
}
