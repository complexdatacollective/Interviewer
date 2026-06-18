/**
 * Filesystem utilities with secure API support.
 *
 * This module provides filesystem operations for Electron and Capacitor platforms.
 * In Electron, it uses the secure electronAPI (via IPC) instead of direct Node.js access.
 * In Capacitor, it uses @capacitor/filesystem for native mobile file access.
 */

import { Buffer } from 'buffer';

import { Filesystem } from '@capacitor/filesystem';

import { capacitorPath } from './capacitorPath';
import inEnvironment, { isElectron } from './Environment';
import environments from './environments';

const toBase64 = (data) => {
  if (typeof data === 'string') return Buffer.from(data).toString('base64');
  if (Buffer.isBuffer(data)) return data.toString('base64');
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString('base64');
  if (data instanceof Uint8Array) return Buffer.from(data).toString('base64');
  return Buffer.from(data).toString('base64');
};

const inSequence = (items, apply) =>
  items.reduce(
    (result, item) => result.then(() => apply(item)),
    Promise.resolve(),
  );

// Path cache for frequently accessed paths (populated on first access)
let pathCache = {};

/**
 * Get the temporary data path.
 * Returns a Promise in Electron (using secure IPC).
 */
const tempDataPath = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return async () => {
      if (pathCache.temp) {
        return pathCache.temp;
      }
      if (isElectron() && window.electronAPI?.app?.getPath) {
        pathCache.temp = await window.electronAPI.app.getPath('temp');
        return pathCache.temp;
      }
      throw new Error('electronAPI not available');
    };
  }

  if (environment === environments.CAPACITOR) {
    return () => 'tmp/';
  }

  throw new Error(`tempDataPath() not available on platform ${environment}`);
});

/**
 * Get the user data path.
 * Returns a Promise in Electron (using secure IPC).
 */
const userDataPath = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return async () => {
      if (pathCache.userData) {
        return pathCache.userData;
      }
      if (isElectron() && window.electronAPI?.app?.getPath) {
        pathCache.userData = await window.electronAPI.app.getPath('userData');
        return pathCache.userData;
      }
      throw new Error('electronAPI not available');
    };
  }

  if (environment === environments.CAPACITOR) {
    return () => '';
  }

  throw new Error(`userDataPath() not available on platform ${environment}`);
});

const resolveFileSystemUrl = inEnvironment((environment) => {
  if (environment === environments.CAPACITOR) {
    return async (path) => {
      const { uri } = await Filesystem.getUri(capacitorPath(path));
      return { toURL: () => uri, nativeURL: uri };
    };
  }

  throw new Error(
    `resolveFileSystemUrl() not available on platform ${environment}`,
  );
});

/**
 * Read a file from the filesystem.
 * In Electron, uses secure IPC.
 */
const readFile = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return async (filename) => {
      if (!isElectron() || !window.electronAPI?.fs?.readFile) {
        throw new Error('electronAPI not available');
      }
      // readFile returns base64 encoded data for binary files
      const data = await window.electronAPI.fs.readFile(filename);
      // Convert base64 back to Buffer
      if (typeof data === 'string') {
        return Buffer.from(data, 'base64');
      }
      return data;
    };
  }

  if (environment === environments.CAPACITOR) {
    return async (filename) => {
      const { data } = await Filesystem.readFile(capacitorPath(filename));
      return Buffer.from(data, 'base64');
    };
  }

  throw new Error(`readFile() not available on platform ${environment}`);
});

/**
 * Write a file to the filesystem.
 * In Electron, uses secure IPC.
 */
const writeFile = inEnvironment((environment) => {
  if (environment === environments.CAPACITOR) {
    return async (filePath, data) => {
      await Filesystem.writeFile({
        ...capacitorPath(filePath),
        data: toBase64(data),
        recursive: true,
      });
      return filePath;
    };
  }

  if (environment === environments.ELECTRON) {
    return async (filePath, data) => {
      if (!isElectron() || !window.electronAPI?.fs?.writeFile) {
        throw new Error('electronAPI not available');
      }
      // Binary data is base64-encoded for IPC; flag it so main decodes it
      // reliably (regardless of size) rather than guessing.
      let dataToWrite = data;
      let isBinary = false;
      if (Buffer.isBuffer(data)) {
        dataToWrite = data.toString('base64');
        isBinary = true;
      } else if (data instanceof ArrayBuffer) {
        dataToWrite = Buffer.from(data).toString('base64');
        isBinary = true;
      } else if (data instanceof Uint8Array) {
        dataToWrite = Buffer.from(data).toString('base64');
        isBinary = true;
      }
      await window.electronAPI.fs.writeFile(filePath, dataToWrite, isBinary);
      return filePath;
    };
  }

  throw new Error(`writeFile() not available on platform ${environment}`);
});

/**
 * Rename a file or directory.
 * In Electron, uses secure IPC.
 */
const rename = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return async (oldPath, newPath) => {
      if (!isElectron() || !window.electronAPI?.fs?.rename) {
        throw new Error('electronAPI not available');
      }
      await window.electronAPI.fs.rename(oldPath, newPath);
      return newPath;
    };
  }

  if (environment === environments.CAPACITOR) {
    return async (oldPath, newPath) => {
      await Filesystem.rename({
        from: capacitorPath(oldPath).path,
        to: capacitorPath(newPath).path,
        directory: capacitorPath(oldPath).directory,
        toDirectory: capacitorPath(newPath).directory,
      });
      return newPath;
    };
  }

  throw new Error(`rename() not available on platform ${environment}`);
});

/**
 * Remove a directory recursively.
 * In Electron, uses secure IPC with safety checks.
 */
const removeDirectory = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return async (targetPath) => {
      if (!isElectron() || !window.electronAPI?.fs?.rmdir) {
        throw new Error('electronAPI not available');
      }

      // Safety check: only allow removal of paths within safe directories
      const safeDirectories = [await userDataPath(), await tempDataPath()];

      const isSafe = safeDirectories.some((safePath) =>
        targetPath.includes(safePath),
      );
      if (!isSafe) {
        throw new Error(
          'Attempted to remove path outside of safe directories!',
        );
      }

      await window.electronAPI.fs.rmdir(targetPath);
      return targetPath;
    };
  }

  if (environment === environments.CAPACITOR) {
    return async (targetPath) => {
      try {
        await Filesystem.rmdir({
          ...capacitorPath(targetPath),
          recursive: true,
        });
      } catch (error) {
        if (!/not.*exist|does not exist/i.test(error?.message || ''))
          throw error;
      }
      return targetPath;
    };
  }

  throw new Error(`removeDirectory() not available on platform ${environment}`);
});

/**
 * Ensure a path exists, creating directories as needed.
 * In Electron, uses secure IPC.
 */
const ensurePathExists = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return async (targetPath) => {
      if (!targetPath) {
        throw new Error('No path provided to ensurePathExists');
      }

      if (!isElectron() || !window.electronAPI?.fs?.mkdirp) {
        throw new Error('electronAPI not available');
      }

      await window.electronAPI.fs.mkdirp(targetPath);
    };
  }

  if (environment === environments.CAPACITOR) {
    return async (targetPath) => {
      if (!targetPath) {
        throw new Error('No path provided to ensurePathExists');
      }
      try {
        await Filesystem.mkdir({
          ...capacitorPath(targetPath),
          recursive: true,
        });
      } catch (error) {
        // Suppress only the "directory already exists" case (mkdir recursive);
        // re-throw genuine failures, including "no such file"/"does not exist".
        const message = error?.message || '';
        if (!/exist/i.test(message) || /not exist|no such/i.test(message)) {
          throw error;
        }
      }
      return targetPath;
    };
  }

  throw new Error(
    `ensurePathExists() not available on platform ${environment}`,
  );
});

// Capacitor only: list a directory's entries, used to skip reads for files that
// don't exist (the native Filesystem plugin logs a failed read as an error).
const readDirectory = inEnvironment((environment) => {
  if (environment === environments.CAPACITOR) {
    return async (path) => {
      const { files } = await Filesystem.readdir(capacitorPath(path));
      return files.map((file) => (typeof file === 'string' ? file : file.name));
    };
  }

  throw new Error(`readDirectory() not available on platform ${environment}`);
});

export {
  userDataPath,
  tempDataPath,
  ensurePathExists,
  rename,
  removeDirectory,
  readFile,
  readDirectory,
  resolveFileSystemUrl,
  writeFile,
  inSequence,
};
