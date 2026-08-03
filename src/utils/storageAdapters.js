import localforage from 'localforage';
import reduxPersistStorage from 'redux-persist/lib/storage';

localforage.config({ name: 'networkCanvas6', storeName: 'redux_store' });

/**
 * redux-persist storage engine backed by IndexedDB via localforage. Used on
 * Capacitor (mobile webview) where localStorage is too small for interview state.
 */
export const localforageStorageEngine = (onPersistReady) => {
  Promise.resolve().then(onPersistReady);
  return {
    getItem: (key) => localforage.getItem(key),
    setItem: (key, value) => localforage.setItem(key, value),
    removeItem: (key) => localforage.removeItem(key),
  };
};

/**
 * redux-persist localStorage engine (Electron + plain web).
 */
export const localStorageEngine = (onPersistReady) => {
  Promise.resolve().then(onPersistReady);
  return reduxPersistStorage;
};
