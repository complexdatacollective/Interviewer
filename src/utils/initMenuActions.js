/**
 * Menu actions handler with secure API support.
 */

import { actionCreators as sessionActions } from '../ducks/modules/session';
import { actionCreators as uiActions } from '../ducks/modules/ui';
import { store } from '../ducks/store';
import { isElectron } from './Environment';

const initMenuActions = () => {
  if (!isElectron() || !window.electronAPI?.ipc) {
    return;
  }

  window.electronAPI.ipc.on('OPEN_SETTINGS_MENU', () => {
    store.dispatch(uiActions.update({ settingsMenuOpen: true }));
  });

  window.electronAPI.ipc.on('EXIT_INTERVIEW', () => {
    store.dispatch(sessionActions.endSession());
  });
};

export default initMenuActions;
