/**
 * File opener handler with secure API support.
 */
import { store } from '../ducks/store';
import { isElectron } from './Environment';
import { importProtocolFromFile } from './protocol/importProtocol';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';

const initFileOpener = () => {
  if (!isElectron() || !window.electronAPI?.ipc) {
    console.warn('[initFileOpener] electronAPI not available');
    return;
  }

  window.electronAPI.ipc.on('OPEN_FILE', (protocolPath) => {
    console.log(`Open file "${protocolPath}"`);

    const state = store.getState();
    const { activeSessionId } = state;

    if (activeSessionId) {
      console.log('Interview in progress.');

      store.dispatch(dialogActions.openDialog({
        type: 'Notice',
        title: 'Interview currently in progress',
        message: 'You are currently conducting an interview. Please complete the interview, or return to the start screen before installing a new protocol.',
      }));

      return;
    }

    importProtocolFromFile(protocolPath);
  });

  window.electronAPI.ipc.send('GET_ARGF');
};

export default initFileOpener;
