/* eslint-disable global-require */

import { isElectron, isCordova } from '../utils/Environment';

class ServerDiscoverer {
  constructor() {
    let EventEmitter;
    let diont;
    if (isElectron()) {
      EventEmitter = window.require('eventemitter3');
      diont = window.require('diont')();
    }

    if (isCordova()) {
      EventEmitter = require('eventemitter3');
      diont = window.Diont();
    }

    if (!isElectron() && !isCordova()) {
      return { on: () => { /* noop */ } };
    }
    this.events = new EventEmitter();
    diont.on('serviceAnnounced', response => this.events.emit('SERVICE_ANNOUNCED', response));
  }

  on(...args) {
    this.events.on(...args);
  }
}

export default ServerDiscoverer;
