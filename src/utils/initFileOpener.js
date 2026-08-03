/**
 * File opener handler with secure API support.
 */

import { actionCreators as dialogActions } from '../ducks/modules/dialogs';
import { store } from '../ducks/store';
import { isElectron } from './Environment';
import { importProtocolFromFile } from './protocol/importProtocol';

const initFileOpener = () => {
  if (!isElectron() || !window.electronAPI?.ipc) {
    return;
  }

  window.electronAPI.ipc.on('OPEN_FILE', (protocolPath) => {
    const state = store.getState();
    const { activeSessionId } = state;

    if (activeSessionId) {
      store.dispatch(
        dialogActions.openDialog({
          type: 'Notice',
          title: 'Interview currently in progress',
          message:
            'You are currently conducting an interview. Please complete the interview, or return to the start screen before installing a new protocol.',
        }),
      );

      return;
    }

    importProtocolFromFile(protocolPath);
  });

  window.electronAPI.ipc.send('GET_ARGF');
};

export default initFileOpener;
