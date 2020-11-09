import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import { createHashHistory as createHistory } from 'history';
import { getEnv, isCordova } from '../utils/Environment';
import logger from './middleware/logger';
import epics from './middleware/epics';
import createRootReducer from './modules/rootReducer';

const checkDeviceIsReady = () => new Promise((resolve) => {
  document.addEventListener('deviceready', () => {
    console.log('device is ready!');
    resolve();
  }, { once: true });
});

const createDatabase = () => new Promise((resolve, reject) => {
  const doThings = () => {
    if (window.db) {
      resolve(window.db);
    }

    try {
      const db = window.sqlitePlugin.openDatabase({
        name: 'redux-store-db',
        location: 'default',
        androidDatabaseProvider: 'system',
      }, () => {
        window.db = db;
        resolve(window.db);
      }, reject);
    } catch (e) {
      setTimeout(() => {
        console.log('waiting to create database');
        doThings();
      }, 5000);
    }
  };

  doThings();
});

const createTable = db => new Promise((resolve, reject) => {
  const doThings = () => {
    try {
      db.transaction((tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS redux_store (key, value)', []);
      }, (err) => {
        reject(err);
      }, (res) => {
        console.log('...table created');
        return resolve(db);
      });
    } catch (e) {
      setTimeout(() => {
        console.log('waiting for create table');
        doThings();
      }, 5000);
    }
  };

  doThings();
});


const createDataBaseIfNeeded = () => {
  console.log('createDatabaseifneeded');
  return checkDeviceIsReady()
    .then(createDatabase)
    .then(createTable)
    .then(() => new Promise((resolve, reject) => {
      console.log('enabling persistance');
      persistor.persist();
      resolve();
    }));
};

const asyncStorage = () => {
  const onStorageReady = (callback) => {
    const setup = createDataBaseIfNeeded();
    return (...args) => setup.then(db => callback(db, ...args));
    // return (...args) => callback(window.db, ...args);
  };

  // createDataBaseIfNeeded();

  return {
    getItem: onStorageReady((db, key) => new Promise((resolve, reject) => {
      window.db.transaction((tx) => {
        tx.executeSql('SELECT value FROM redux_store WHERE key = ?', [key], (tx, rs) => {
          if (rs.rows.length === 0) {
            console.log('no rows');
            resolve(null);
          }
          if (!rs.rows.item(0) || !rs.rows.item(0).value) {
            console.log('no value');
            resolve(null);
          }
          console.log('full value result', rs.rows.item(0).value);
          resolve(rs.rows.item(0).value);
        });
      }, (err) => {
        console.log('err', err);
        reject();
      }, (res) => {
        console.log('result', res);
      });
    })),
    setItem: onStorageReady((db, key, value) => new Promise((resolve, reject) => {
      window.db.transaction((tx) => {
        tx.executeSql('UPDATE redux_store SET value = ? WHERE key = ?', [value, key], (tx, rs) => {
          console.log('update', rs, rs.rows);
          resolve();
        });
      }, (err) => {
        console.log('err', err);
        reject();
      }, (res) => {
        console.log('result', res);
      });
    })),
    removeItem: onStorageReady(() => {

    }),
  };
};

const getStorageEngine = () => {
  if (isCordova()) {
    return asyncStorage();
  }

  return storage;
};

const persistConfig = {
  key: 'networkCanvas6',
  storage: getStorageEngine(),
  timeout: null,
  whitelist: [
    'deviceSettings',
    'pairedServer',
    'installedProtocols',
    'router',
    'search',
    'activeSessionId',
    'sessions',
    'dismissedUpdates',
  ],
};

const env = getEnv();

export const history = createHistory();

const getReducer = () => {
  if (env.REACT_APP_NO_PERSIST) {
    return createRootReducer(history);
  }
  console.log('persist', persistConfig);
  return persistReducer(persistConfig, createRootReducer(history));
};

export const store = createStore(
  getReducer(),
  undefined,
  compose(
    applyMiddleware(routerMiddleware(history), thunk, epics, logger),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
      ? window.devToolsExtension()
      : f => f,
  ),
);

export const persistor = persistStore(store, { manualPersist: true });
