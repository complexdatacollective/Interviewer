/* eslint-disable no-console */

const on = (channel, cb) => { console.log(channel, cb); };
const send = (message) => { console.log(message); };

module.exports = {
  ipcRenderer: {
    send,
    on,
  },
};
