/* eslint-disable global-require */

import { isElectron, isCordova } from '../utils/Environment';

let EventEmitter;
let diont;

if (isElectron()) {
  EventEmitter = window.require('events').EventEmitter;
  diont = window.require('diont')();
}

if (isCordova()) {
  EventEmitter = window.require('events').EventEmitter;
  diont = window.Diont();
}

class ServerDiscoverer {
  constructor() {
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
