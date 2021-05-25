import { CancellationError } from 'builder-util-runtime';
import { findKey } from 'lodash';
import { store } from '../../ducks/store';

import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import {
  removeDirectory,
  rename,
} from '../filesystem';
import protocolPath from './protocolPath';

const renameProtocol = (previousUuid, currentUuid) => {
  // delete contents of previous uuid, and move current content directory to previous uuid location
  const previousDir = protocolPath(previousUuid);
  const currentDir = protocolPath(currentUuid);

  return removeDirectory(previousDir)
  .then(() => rename(currentDir, previousDir));
}

const checkExistingSession = (currentName) => {
  const state = store.getState();
  const dispatch = store.dispatch;

  const existingIndex = findKey(state.installedProtocols,
    protocol => protocol.name === currentName);
  const unExportedSession = findKey(state.sessions,
    session => session.protocolUID === existingIndex && !session.exportedAt);
  if (unExportedSession) {
    const message = 'This protocol is already installed, and in-progress sessions using it have not yet been exported. Please export or delete these sessions before attempting to overwrite the protocol.';
    return Promise.reject(message);
  }

  const existingSession = findKey(state.sessions,
    session => session.protocolUID === existingIndex);
  if (existingSession) {
    return new Promise((resolve, reject) => dispatch(dialogActions.openDialog({
      type: 'Warning',
      title: 'Overwrite existing protocol?',
      confirmLabel: 'Overwrite protocol',
      onConfirm: () => resolve(existingIndex),
      onCancel: () => reject(new CancellationError('Installation of this protocol cancelled.')),
      message: 'This protocol is already installed. Overwriting the previous installation of this protocol may prevent you from modifying previously created sessions.',
    })));
  }

  if (existingIndex) {
    return new Promise((resolve) => dispatch(dialogActions.openDialog({
      type: 'Notice',
      title: 'Update protocol installation',
      confirmLabel: 'Continue',
      onConfirm: () => resolve(existingIndex),
      message: 'This protocol is already installed and will be updated.',
    })));
  }

  return Promise.resolve(existingIndex);
}

export const moveToExistingProtocol = (existingIndex, protocolContent) => {
  return renameProtocol(existingIndex, protocolContent.uid)
    .then(() => protocolContent);
}

export default checkExistingSession;
