const { contextBridge, ipcRenderer } = require('electron');

const getAppVersion = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve('7.0.0');
  }, 5000);
});

contextBridge.exposeInMainWorld('api', {
  getAppVersion: getAppVersion,
  getApiSource: () => 'electron',
});
