/**
 * Remote control handler for preview mode with secure API support.
 */
import environments from './environments';
import inEnvironment, { isElectron } from './Environment';
import { store } from '../ducks/store';
import { actionCreators as remoteActions } from '../ducks/modules/remote';

const init = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return () => {
      if (!isElectron() || !window.electronAPI?.ipc?.on) {
        console.warn('[remote] electronAPI not available');
        return;
      }

      window.electronAPI.ipc.on('remote:preview', (protocol, stageId) => {
        store.dispatch(remoteActions.previewStage(protocol, stageId));
      });

      window.electronAPI.ipc.on('remote:reset', () => {
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
