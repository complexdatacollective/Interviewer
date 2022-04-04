import fs from 'fs'
import fse from 'fs-extra';
import path from 'path';

import { contextBridge, ipcRenderer } from 'electron'
import { domReady } from './utils'
import { useLoading } from './loading'

const { appendLoading, removeLoading } = useLoading();

(async () => {
  await domReady()

  appendLoading()
})()

const devMode = process.env.NODE_ENV === 'development'

// --------- Expose some API to the Renderer process. ---------
contextBridge.exposeInMainWorld('fs', fs)
contextBridge.exposeInMainWorld('fse', fse)
contextBridge.exposeInMainWorld('path', path)
contextBridge.exposeInMainWorld('devMode', devMode)

contextBridge.exposeInMainWorld('saveFile', async (options, data) => {
    return await ipcRenderer.invoke('save-file', options, data);
});

contextBridge.exposeInMainWorld('openFile', async (filePath) => {
    return await ipcRenderer.invoke('open-file', filePath);
});

contextBridge.exposeInMainWorld('openDialog', async (dialogOptions) => {
  return await ipcRenderer.invoke('open-dialog', dialogOptions)
});

contextBridge.exposeInMainWorld('removeLoading', removeLoading)
contextBridge.exposeInMainWorld('ipcRenderer', withPrototype(ipcRenderer))

// `exposeInMainWorld` can't detect attributes and methods of `prototype`, manually patching it.
function withPrototype(obj) {
  const protos = Object.getPrototypeOf(obj)

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) continue

    if (typeof value === 'function') {
      // Some native APIs, like `NodeJS.EventEmitter['on']`, don't work in the Renderer process. Wrapping them into a function.
      obj[key] = function (...args) {
        return value.call(obj, ...args)
      }
    } else {
      obj[key] = value
    }
  }
  return obj
}
