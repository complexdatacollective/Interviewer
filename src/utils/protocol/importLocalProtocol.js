import { store } from '../../ducks/store';
import { isCordova, isElectron } from '../Environment';
import { actionCreators as protocolActions } from '../../ducks/modules/importProtocol';

const importLocalProtocol = () => {
  if (isElectron()) {
    const ipcRenderer = window.require('electron').ipcRenderer;
    ipcRenderer.send('OPEN_DIALOG');
  }

  if (isCordova()) {
    window.chooser.getFile()
      .then((file) => {
        if (file && file.uri) {
          store.dispatch(protocolActions.importProtocolFromFile(file.uri, file.name));
        }
      });
  }

  return Error('Environment not supported');
};

export default importLocalProtocol;
