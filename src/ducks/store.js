/* eslint-disable @codaco/spellcheck/spell-checker */
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

// eslint-disable-next-line import/no-mutable-exports
let persistor;

const DATABASE_NAME = 'redux-store-db';
const TABLE_NAME = 'redux_store'; // Cannot contain dashes
// const TABLE_KEY = 'networkCanvas6';

const checkDeviceIsReady = () => new Promise((resolve) => {
  document.addEventListener('deviceready', () => {
    resolve();
  }, { once: true });
});

const createDatabase = () => new Promise((resolve) => {
  const tryDatabaseOpen = () => {
    if (window.db) {
      resolve();
    }

    try {
      window.db = window.sqlitePlugin.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
      }, () => {
        resolve();
      }, () => {
        throw new Error('Database unavailable!');
      });
    } catch (e) {
      setTimeout(() => {
        // eslint-disable-next-line no-console
        console.log('waiting to create database');
        tryDatabaseOpen();
      }, 5000);
    }
  };

  tryDatabaseOpen();
});

const createTable = () => window.query(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (key, value)`, []);

window.formatQueryResult = (results) => {
  const arr = [];
  const len = results.rows.length;

  for (let i = 0; i < len; i += 1) {
    arr.push(results.rows.item(i));
  }

  return arr;
};


window.query = (query, parameters = []) => new Promise((resolve, reject) => {
  // transation is the only API that seems somewhat stable. executeSql by itself failed randomly.
  window.db.transaction((tx) => {
    tx.executeSql(query, parameters, (_, rs) => {
      resolve(rs);
    }, (error) => {
      reject(error.message);
    });
  }, (err) => {
    reject(err);
  }, () => {
    resolve();
  });
});

const asyncStorage = () => {
  let ready = false;

  const onStorageReady = () => {
    if (ready) {
      return;
    }

    checkDeviceIsReady()
      .then(createDatabase)
      .then(createTable)
      .then(() => new Promise((resolve) => {
        persistor.persist();
        resolve();
      }))
      .then(() => {
        ready = true;
      });
  };

  onStorageReady();

  return {
    getItem: key => new Promise((resolve, reject) => {
      window.query(`SELECT value FROM ${TABLE_NAME} WHERE key = ?`, [key])
        .then((results) => {
          resolve(window.formatQueryResult(results)[0].value);
        })
        .catch(reject);
    }),
    setItem: (key, value) => new Promise((resolve, reject) => {
      // Update or insert?
      window.query(`SELECT value FROM ${TABLE_NAME} WHERE key = ?`, [key]).then((results) => {
        if (results.rows.length > 0) {
          window.query(`UPDATE ${TABLE_NAME} SET value = ? WHERE key = ?`, [value, key]).then(() => {
            resolve();
          }).catch(reject);
          return;
        }

        window.query(`INSERT INTO ${TABLE_NAME} (key,value) VALUES (?,?)`, [key, value]).then(() => {
          resolve();
        }).catch(reject);
      });
    }),
    removeItem: () => {
    },
  };
};

window.getAll = () => {
  // eslint-disable-next-line no-console
  window.query(`SELECT value FROM ${TABLE_NAME}`).then(results => console.log(results));
};

window.resetDB = () => {
  window.query(`DROP TABLE IF EXISTS ${TABLE_NAME}`, []);
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

persistor = persistStore(store, { manualPersist: true });

export { persistor };
