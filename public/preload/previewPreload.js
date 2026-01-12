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
const validSendChannels = [
  'READY',
  'add-cert',
  'GET_ARGF',
  'OPEN_DIALOG',
];

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
        console.warn(`[electronAPI] Invalid send channel: ${channel}`);
      }
    },
    on: (channel, callback) => {
      if (validReceiveChannels.includes(channel)) {
        const subscription = (event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
      }
      console.warn(`[electronAPI] Invalid receive channel: ${channel}`);
      return () => {};
    },
    once: (channel, callback) => {
      if (validReceiveChannels.includes(channel)) {
        ipcRenderer.once(channel, (event, ...args) => callback(...args));
      } else {
        console.warn(`[electronAPI] Invalid once channel: ${channel}`);
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
    showMessageBox: (options) => ipcRenderer.invoke('dialog:showMessageBox', options),
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
    readJson: (filePath) => ipcRenderer.invoke('fs:readJson', filePath),
    writeJson: (filePath, data, options) => ipcRenderer.invoke('fs:writeJson', filePath, data, options),
    readFile: (filePath, encoding) => ipcRenderer.invoke('fs:readFile', filePath, encoding),
    writeFile: (filePath, data) => ipcRenderer.invoke('fs:writeFile', filePath, data),
    copy: (src, dest) => ipcRenderer.invoke('fs:copy', src, dest),
    unlink: (filePath) => ipcRenderer.invoke('fs:unlink', filePath),
    remove: (filePath) => ipcRenderer.invoke('fs:remove', filePath),
    rename: (oldPath, newPath) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
    access: (filePath, mode) => ipcRenderer.invoke('fs:access', filePath, mode),
    stat: (filePath) => ipcRenderer.invoke('fs:stat', filePath),
    mkdirp: (dirPath) => ipcRenderer.invoke('fs:mkdirp', dirPath),
    pathExists: (filePath) => ipcRenderer.invoke('fs:pathExists', filePath),
    readdir: (dirPath) => ipcRenderer.invoke('fs:readdir', dirPath),
    outputFile: (filePath, data) => ipcRenderer.invoke('fs:outputFile', filePath, data),
    // Additional methods needed by network-canvas
    createWriteStream: (filePath) => ipcRenderer.invoke('fs:createWriteStream', filePath),
    mkdir: (dirPath, options) => ipcRenderer.invoke('fs:mkdir', dirPath, options),
    rmdir: (dirPath) => ipcRenderer.invoke('fs:rmdir', dirPath),
  },

  // ===================
  // Path Operations
  // ===================
  path: {
    join: (...args) => ipcRenderer.invoke('path:join', ...args),
    basename: (filePath, ext) => ipcRenderer.invoke('path:basename', filePath, ext),
    dirname: (filePath) => ipcRenderer.invoke('path:dirname', filePath),
    extname: (filePath) => ipcRenderer.invoke('path:extname', filePath),
    parse: (filePath) => ipcRenderer.invoke('path:parse', filePath),
    resolve: (...args) => ipcRenderer.invoke('path:resolve', ...args),
    normalize: (filePath) => ipcRenderer.invoke('path:normalize', filePath),
    relative: (from, to) => ipcRenderer.invoke('path:relative', from, to),
  },

  // ===================
  // Archive Operations
  // ===================
  archive: {
    create: (sourcePath, destPath) => ipcRenderer.invoke('archive:create', sourcePath, destPath),
    extract: (sourcePath, destPath) => ipcRenderer.invoke('archive:extract', sourcePath, destPath),
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
    setVisualZoomLevelLimits: (min, max) => ipcRenderer.invoke('webFrame:setVisualZoomLevelLimits', min, max),
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

  // ===================
  // Export Operations
  // ===================
  export: {
    start: (data) => ipcRenderer.invoke('export:start', data),
    abort: () => ipcRenderer.invoke('export:abort'),
    setConsideringAbort: (value) => ipcRenderer.invoke('export:setConsideringAbort', value),
    onBegin: (callback) => {
      const subscription = (_, data) => callback(data);
      ipcRenderer.on('export:begin', subscription);
      return () => ipcRenderer.removeListener('export:begin', subscription);
    },
    onUpdate: (callback) => {
      const subscription = (_, data) => callback(data);
      ipcRenderer.on('export:update', subscription);
      return () => ipcRenderer.removeListener('export:update', subscription);
    },
    onSessionExported: (callback) => {
      const subscription = (_, sessionId) => callback(sessionId);
      ipcRenderer.on('export:session-exported', subscription);
      return () => ipcRenderer.removeListener('export:session-exported', subscription);
    },
    onError: (callback) => {
      const subscription = (_, error) => callback(error);
      ipcRenderer.on('export:error', subscription);
      return () => ipcRenderer.removeListener('export:error', subscription);
    },
    onFinished: (callback) => {
      const subscription = (_, data) => callback(data);
      ipcRenderer.on('export:finished', subscription);
      return () => ipcRenderer.removeListener('export:finished', subscription);
    },
    onCancelled: (callback) => {
      const subscription = (_, data) => callback(data);
      ipcRenderer.on('export:cancelled', subscription);
      return () => ipcRenderer.removeListener('export:cancelled', subscription);
    },
    removeAllListeners: () => {
      ['export:begin', 'export:update', 'export:session-exported', 'export:error', 'export:finished', 'export:cancelled']
        .forEach((channel) => ipcRenderer.removeAllListeners(channel));
    },
  },
});

// Log that preload script has loaded (for debugging)
console.log('[electronAPI] Preview preload script loaded - secure IPC bridge initialized');
