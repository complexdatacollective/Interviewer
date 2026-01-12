/**
 * Menu actions handler with secure API support.
 */
import { store } from '../ducks/store';
import { isElectron } from './Environment';
import { actionCreators as uiActions } from '../ducks/modules/ui';
import { actionCreators as sessionActions } from '../ducks/modules/session';

const initMenuActions = () => {
  if (!isElectron() || !window.electronAPI?.ipc) {
    console.warn('[initMenuActions] electronAPI not available');
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
