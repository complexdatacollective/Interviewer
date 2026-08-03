/**
 * Preload script for the Network Canvas preview window.
 * Exposes a secure API via contextBridge for renderer process access.
 *
 * This replaces direct Node.js access (nodeIntegration: true) with a
 * controlled, whitelisted set of IPC channels and operations.
 *
 * Note: This is loaded when Network Canvas runs as a preview window
 * inside Architect. It provides the same API surface as the main
 * Architect preload but with preview-specific channels.
 */
const { contextBridge, ipcRenderer } = require('electron');

// Capture process values before exposing (for sandbox compatibility)
const platformValue = process.platform;
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Check if running in preview mode (launched by Architect)
// Architect passes --preview flag when launching preview window
const isPreviewMode = process.argv.includes('--preview');

// Whitelist of valid IPC channels for send (renderer -> main)
const validSendChannels = ['READY', 'add-cert', 'GET_ARGF', 'OPEN_DIALOG'];

// Whitelist of valid IPC channels for receive (main -> renderer)
const validReceiveChannels = [
  'remote:preview',
  'remote:reset',
  'OPEN_FILE',
  'RESET_STATE',
  'OPEN_SETTINGS_MENU',
  'EXIT_INTERVIEW',
  'add-cert-complete',
  'GET_ARGF',
];

contextBridge.exposeInMainWorld('electronAPI', {
  // ===================
  // IPC Communication
  // ===================
  ipc: {
    send: (channel, ...args) => {
      if (validSendChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
      } else {
      }
    },
    on: (channel, callback) => {
      if (validReceiveChannels.includes(channel)) {
        const subscription = (_event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
      }
      return () => {};
    },
    once: (channel, callback) => {
      if (validReceiveChannels.includes(channel)) {
        ipcRenderer.once(channel, (_event, ...args) => callback(...args));
      } else {
      }
    },
    removeAllListeners: (channel) => {
      if (validReceiveChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },

  // ===================
  // Dialog Operations
  // ===================
  dialog: {
    showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpen', options),
    showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSave', options),
    showMessageBox: (options) =>
      ipcRenderer.invoke('dialog:showMessageBox', options),
  },

  // ===================
  // App Info
  // ===================
  app: {
    getPath: (name) => ipcRenderer.invoke('app:getPath', name),
    getAppPath: () => ipcRenderer.invoke('app:getAppPath'),
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
  },

  // ===================
  // File System Operations
  // ===================
  fs: {
    readFile: (filePath, encoding) =>
      ipcRenderer.invoke('fs:readFile', filePath, encoding),
    writeFile: (filePath, data, isBinary) =>
      ipcRenderer.invoke('fs:writeFile', filePath, data, isBinary),
    rename: (oldPath, newPath) =>
      ipcRenderer.invoke('fs:rename', oldPath, newPath),
    mkdirp: (dirPath) => ipcRenderer.invoke('fs:mkdirp', dirPath),
    mkdir: (dirPath, options) =>
      ipcRenderer.invoke('fs:mkdir', dirPath, options),
    rmdir: (dirPath) => ipcRenderer.invoke('fs:rmdir', dirPath),
  },

  // ===================
  // Path Operations
  // ===================
  path: {
    join: (...args) => ipcRenderer.invoke('path:join', ...args),
    basename: (filePath, ext) =>
      ipcRenderer.invoke('path:basename', filePath, ext),
    dirname: (filePath) => ipcRenderer.invoke('path:dirname', filePath),
    extname: (filePath) => ipcRenderer.invoke('path:extname', filePath),
    parse: (filePath) => ipcRenderer.invoke('path:parse', filePath),
    resolve: (...args) => ipcRenderer.invoke('path:resolve', ...args),
    normalize: (filePath) => ipcRenderer.invoke('path:normalize', filePath),
    relative: (from, to) => ipcRenderer.invoke('path:relative', from, to),
  },

  // ===================
  // Protocol Operations
  // ===================
  protocol: {
    download: (uri) => ipcRenderer.invoke('protocol:download', uri),
  },

  // ===================
  // Archive Operations
  // ===================
  archive: {
    create: (sourcePath, destPath) =>
      ipcRenderer.invoke('archive:create', sourcePath, destPath),
    extract: (sourcePath, destPath) =>
      ipcRenderer.invoke('archive:extract', sourcePath, destPath),
  },

  // ===================
  // Shell Operations
  // ===================
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
    openPath: (filePath) => ipcRenderer.invoke('shell:openPath', filePath),
  },

  // ===================
  // Window Operations
  // ===================
  window: {
    hide: () => ipcRenderer.invoke('window:hide'),
    show: () => ipcRenderer.invoke('window:show'),
    close: () => ipcRenderer.invoke('window:close'),
    setFullScreen: (flag) => ipcRenderer.invoke('window:setFullScreen', flag),
    isFullScreen: () => ipcRenderer.invoke('window:isFullScreen'),
  },

  // ===================
  // WebFrame Operations (for zoom control)
  // ===================
  webFrame: {
    setVisualZoomLevelLimits: (min, max) =>
      ipcRenderer.invoke('webFrame:setVisualZoomLevelLimits', min, max),
  },

  // ===================
  // Platform Info
  // ===================
  platform: platformValue,

  // ===================
  // Environment Info
  // ===================
  env: {
    isDevelopment,
    isProduction,
    isPreview: isPreviewMode,
    platform: platformValue,
  },
});
