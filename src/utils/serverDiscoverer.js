/* eslint-disable global-require */

import { isElectron, isCordova } from '../utils/Environment';

class ServerDiscoverer {
  constructor() {
    if (!isElectron() && !isCordova()) {
      return { on: () => { /* noop */ } };
    }

    const EventEmitter = window.require('eventemitter3');
    this.events = new EventEmitter();

    if (isElectron()) {
      const mdns = window.require('mdns');

      const browser = mdns.createBrowser({ name: 'network-canvas', protocol: 'tcp' });
      browser.on('serviceUp', (service) => {
        this.events.emit('SERVICE_ANNOUNCED', service);
        console.log(service);
      });
      browser.on('serviceDown', (service) => {
        this.events.emit('SERVICE_REMOVED', service);
        console.log(service);
      });
      browser.start();
    }

    if (isCordova()) {
      const zeroconf = window.cordova.plugins.zeroconf;
      zeroconf.watchAddressFamily = 'ipv4';

      zeroconf.watch('_network-canvas._tcp.', 'local.', (result) => {
        const action = result.action;
        const service = result.service;
        if (action === 'added') {
          console.log('service added', service);
          this.events.emit('SERVICE_ANNOUNCED', service);
        } else if (action === 'resolved') {
          console.log('service resolved', service);
          this.events.emit('SERVICE_RESOLVED', service);
        } else {
          console.log('service removed', service);
          this.events.emit('SERVICE_REMOVED', service);
        }
      });
    }
  }

  on(...args) {
    this.events.on(...args);
  }
}

export default ServerDiscoverer;
