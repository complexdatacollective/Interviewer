import { store } from '../../ducks/store';
import { isCordova, isElectron } from '../Environment';
import { actionCreators as protocolActions } from '../../ducks/modules/importProtocol';

const importLocalProtocol = () => {
  if (isElectron()) {
    const ipcRenderer = window.electron.ipcRenderer;
    ipcRenderer.send('OPEN_DIALOG');
  }

  if (isCordova()) {
    window.chooser.getFile()
      .then((file) => {
        if (file.uri) {
          store.dispatch(protocolActions.importProtocolFromFile(file.uri));
        }
      });
  }

  return Error('Environment not supported');
};

export default importLocalProtocol;
