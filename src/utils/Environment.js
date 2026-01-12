import environments from './environments';

/**
 * Environment detection utilities.
 *
 * This module provides environment detection without direct Node.js access.
 * It uses the secure electronAPI exposed via the preload script.
 */

// Check if running in Electron with the secure API
export const isElectron = () => typeof window !== 'undefined' && !!window.electronAPI;

// Check if in development mode
export const isDevMode = () => isElectron() && window.electronAPI.env?.isDevelopment;

// Check if running as preview window in Architect
export const isPreview = () => isElectron() && window.electronAPI.env?.isPreview;

// Get environment variables (limited - no direct process.env access)
// Returns empty object for security - use specific env flags instead
export const getEnv = () => ({});

// Platform detection using secure API
const getPlatform = () => {
  if (isElectron()) {
    return window.electronAPI.env?.platform || window.electronAPI.platform || 'unknown';
  }
  return 'unknown';
};

export const isMacOS = () => isElectron() && getPlatform() === 'darwin';

export const isWindows = () => isElectron() && getPlatform() === 'win32';

export const isLinux = () => isElectron() && getPlatform() === 'linux';

export const isCordova = () => typeof window !== 'undefined' && !!window.cordova;

export const isIOS = () => isCordova() && (/iOS/i).test(window.device?.platform);

export const isAndroid = () => isCordova() && (/Android/i).test(window.device?.platform);

export const isWeb = () => (!isCordova() && !isElectron());

const getEnvironment = () => {
  if (isCordova()) return environments.CORDOVA;
  if (isElectron()) return environments.ELECTRON;
  return environments.WEB;
};

const inEnvironment = (tree) => (...args) => tree(getEnvironment())(...args);

export default inEnvironment;
