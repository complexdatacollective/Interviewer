import { store } from '../ducks/store';
import { isElectron } from './Environment';
import { importProtocolFromFile } from './protocol/importProtocol';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';

let ipcRenderer;

if (isElectron()) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const initFileOpener = () => {
  ipcRenderer.on('OPEN_FILE', (event, protocolPath) => {
    // eslint-disable-next-line no-console
    console.log(`Open file "${protocolPath}"`);

    const state = store.getState();
    const { activeSessionId } = state;

    // Check if we are in the middle of an interview.
    if (activeSessionId) {
      // eslint-disable-next-line no-console
      console.log('Interview in progress.');

      // TODO: test if the protocol to be installed is the same as the active
      // sesssions protocol. If it is, we disallow installation.

      // For now, just disable protocol install while an interview is in progress.

      store.dispatch(dialogActions.openDialog({
        type: 'Notice',
        title: 'Interview currently in progress',
        message: 'You are currently conducting an interview. Please complete the interview, or return to the start screen before installing a new protocol.',
      }));

      return;
    }

    importProtocolFromFile(protocolPath);
  });

  ipcRenderer.send('GET_ARGF');
};

export default initFileOpener;
