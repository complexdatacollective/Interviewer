/* eslint-disable global-require */

import environments from './environments';
import inEnvironment from './Environment';
import { store } from '../ducks/store';
import { actionCreators as remoteActions } from '../ducks/modules/remote';

const init = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const { ipcRenderer } = window.require('electron');

    return () => {
      ipcRenderer.on('remote:preview', (event, protocol, stageId) => {
        store.dispatch(remoteActions.previewStage(protocol, stageId));
      });

      ipcRenderer.on('remote:reset', () => {
        store.dispatch(remoteActions.reset());
      });
    };
  }

  return () => {};
});

const remote = {
  init,
};

export default remote;
