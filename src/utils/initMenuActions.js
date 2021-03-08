import { store } from '../ducks/store';
import { isElectron } from './Environment';
import { actionCreators as uiActions } from '../ducks/modules/ui';
import { actionCreators as sessionActions } from '../ducks/modules/session';

let ipcRenderer;

if (isElectron()) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const initFileOpener = () => {
  ipcRenderer.on('OPEN_SETTINGS_MENU', () => {
    store.dispatch(uiActions.update({ settingsMenuOpen: true }));
  });

  ipcRenderer.on('EXIT_INTERVIEW', () => {
    store.dispatch(sessionActions.endSession());
  });
};

export default initFileOpener;
