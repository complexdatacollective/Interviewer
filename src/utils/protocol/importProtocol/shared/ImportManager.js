import EventEmitter from "eventemitter3";

export class ImportManager {
  constructor() {
    this.events = new EventEmitter();
  }

  on = (...args) => {
    this.events.on(...args);
  }

  once = (...args) => {
    this.events.once(...args);
  }

  emit(event, payload) {
    if (!event) {
      // eslint-disable-next-line no-console
      console.warn('Malformed emit.');
      return;
    }

    this.events.emit(event, payload);
  }

  removeAllListeners = () => {
    this.events.removeAllListeners();
  }
}
