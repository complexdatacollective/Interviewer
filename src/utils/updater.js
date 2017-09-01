import { isElectron } from '../utils/Environment';

let EventEmitter;
let ipcRenderer;

if (isElectron()) {
  EventEmitter = window.require('events').EventEmitter;
  ipcRenderer = window.require('electron').ipcRenderer;
}

class Updater {
  constructor() {
    if (!isElectron()) { return class {}; }
    this.events = new EventEmitter();
    ipcRenderer.on('UPDATE_AVAILABLE', (event, response) => this.events.emit('UPDATE_AVAILABLE', response));
    ipcRenderer.on('UPDATE_NOT_AVAILABLE', (event, response) => this.events.emit('UPDATE_NOT_AVAILABLE', response));
    ipcRenderer.on('ERROR', (event, response) => { this.events.emit('ERROR', response); });
    ipcRenderer.on('UPDATE_DOWNLOADED', (event, response) => this.events.emit('UPDATE_DOWNLOADED', response));
  }

  on(...args) {
    this.events.on(...args);
  }

  checkForUpdates = () => {
    ipcRenderer.send('CHECK_FOR_UPDATE');
  }

  downloadUpdates = () => {
    ipcRenderer.send('DOWNLOAD_UPDATE');
  }

  installUpdates = () => {
    ipcRenderer.send('INSTALL_UPDATE');
  }
}

export default Updater;
