import localforage from 'localforage';
import reduxPersistStorage from 'redux-persist/lib/storage';

import { getCapacitorPlatform } from './Environment';
import { migrateLegacyCordovaData } from './legacyCordovaMigration';

localforage.config({ name: 'networkCanvas6', storeName: 'redux_store' });

/**
 * redux-persist storage engine backed by IndexedDB via localforage. Used on
 * Capacitor (mobile webview) where localStorage is too small for interview state.
 *
 * Persistence starts only after the one-time migration of the Cordova builds'
 * data, so the store rehydrates from the migrated state. If the migration
 * fails the app still starts, and the next launch retries it.
 */
export const localforageStorageEngine = (onPersistReady) => {
  migrateLegacyCordovaData({
    storage: localforage,
    platform: getCapacitorPlatform(),
  })
    .catch((error) => {
      // oxlint-disable-next-line no-console -- the only diagnostic for a failed migration; the app starts regardless and retries next launch
      console.error('Migrating data from the Cordova build failed', error);
    })
    .then(onPersistReady);

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
