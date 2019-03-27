import { isCordova, isElectron } from '../Environment';

const importLocalProtocol = () => {
  if (isElectron()) {
    const ipcRenderer = window.require('electron').ipcRenderer;
    ipcRenderer.send('OPEN_DIALOG');
  }

  if (isCordova()) {
    console.log('ola');
  }

  return Error('Environment not supported');
};

export default importLocalProtocol;
