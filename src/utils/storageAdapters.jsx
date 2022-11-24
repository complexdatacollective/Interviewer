/* eslint-disable @codaco/spellcheck/spell-checker */
import storage from 'redux-persist/lib/storage';
import { isElectron } from './Environment';

const DATABASE_NAME = 'redux-store-db';
const TABLE_NAME = 'redux_store'; // Cannot contain dashes
let db;

/**
 * Iterates an sqlite result object and returns an array with all result rows
 * @param {object} results - a result object
 * @returns arr - Array of result rows
 */
const formatQueryResult = (results) => {
  const arr = [];
  const len = results.rows.length;

  for (let i = 0; i < len; i += 1) {
    arr.push(results.rows.item(i));
  }

  return arr;
};

/**
 * A wrapper around the transactional query method provided by the plugin. Used to avoid
 * repetitive boilerplate code.
 * @param {string} sql - An SQL statement
 * @param {array} parameters - An array of parameters for query substitution
 */
const query = (sql, parameters = []) => new Promise((resolve, reject) => {
  // transaction is the only API that seems somewhat stable. executeSql by itself failed randomly.
  db.transaction((tx) => {
    tx.executeSql(sql, parameters, (_, rs) => {
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

/**
 * Database methods **MUST NOT** be called before cordova device ready event has fired.
 * This function will return immediately if the event has already fired.
 */
const checkDeviceIsReady = () => new Promise((resolve) => {
  if (isElectron()) {
    resolve();
  }

  document.addEventListener('deviceready', () => {
    resolve();
  }, { once: true });
});

/**
 * Attempt to open the database using the cordova sqlite plugin.
 * Opening will create the database if it does not exist
 *
 * There is a small chance that the plugin will not have yet initialized even though
 * device ready has been fired. We retry every 2 seconds until the database is available.
 */
const createDatabase = () => new Promise((resolve) => {
  const tryDatabaseOpen = () => {
    if (db) {
      resolve();
    }

    try {
      db = window.sqlitePlugin.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
        androidDatabaseProvider: 'system',
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
      }, 2000);
    }
  };

  tryDatabaseOpen();
});

/**
 * Creates the table used by this store.
 *
 * This is here to potentially aid in having multiple SQL tables for different data in the
 * future.
 */
const createTable = () => query(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (key, value)`, []);

/**
 * Helper function for inspecting the contents of the table.
 */
export const getAll = () => {
  // eslint-disable-next-line no-console
  query(`SELECT key, value FROM ${TABLE_NAME}`).then((results) => console.log(results));
};

window.getAll = getAll;

/**
 * Delete all records from table
 */
export const resetDB = () => query(`DROP TABLE IF EXISTS ${TABLE_NAME}`, []);

window.resetDB = resetDB;

/**
 * Delete sqlite database and all content
 */
export const deleteDB = (dbName = DATABASE_NAME) => new Promise((resolve, reject) => {
  window.sqlitePlugin.deleteDatabase({
    name: dbName,
    location: 'default',
    androidDatabaseProvider: 'system',
  }, () => {
    // eslint-disable-next-line no-console
    console.log('Database deleted');
    resolve();
  }, (error) => {
    // eslint-disable-next-line no-console
    console.error('Error deleting database:', error);
    reject(error);
  });
});

window.deleteDB = deleteDB;

/**
 * Provides a redux-persist compatible wrapper around the cordova sqlite plugin.
 * @param {function} onPersistReady - callback function called when the database is ready to store
 * and retrieve data.
 */
export const sqliteStorageEngine = (onPersistReady) => {
  // This chain ensures the storage engine is ready, and then calls the callback to enable
  // persistence.
  checkDeviceIsReady() // Device ready has fired
    .then(createDatabase) // Create or open the database
    .then(createTable) // Create the table if it does not exist
    .then(onPersistReady);

  return {
    getItem: (key) => new Promise((resolve, reject) => {
      query(`SELECT value FROM ${TABLE_NAME} WHERE key = ?`, [key])
        .then((results) => {
          resolve(formatQueryResult(results)[0].value);
        })
        .catch(reject);
    }),
    setItem: (key, value) => new Promise((resolve, reject) => {
      // UPDATE doesn't work if there's no existing record matching `key`, so INSERT in that case
      query(`SELECT value FROM ${TABLE_NAME} WHERE key = ?`, [key]).then((results) => {
        if (results.rows.length > 0) {
          query(`UPDATE ${TABLE_NAME} SET value = ? WHERE key = ?`, [value, key]).then(() => {
            resolve();
          }).catch(reject);
          return;
        }

        query(`INSERT INTO ${TABLE_NAME} (key,value) VALUES (?,?)`, [key, value]).then(() => {
          resolve();
        }).catch(reject);
      });
    }),
    removeItem: (key) => new Promise((resolve, reject) => {
      query(`DELETE FROM ${TABLE_NAME} WHERE key = ?`, [key]).then(() => {
        resolve();
      }).catch(reject);
    }),
  };
};

/**
 * Simple wrapper around default localStorage storage engine using onPersistReady callback to
 * enable persistence.
 * @param {function} onPersistReady - Callback function called when the storage engine is ready
 * to store and retrieve data
 */
export const localStorageEngine = (onPersistReady) => {
  checkDeviceIsReady()
    .then(() => {
      onPersistReady();
    });
  return storage;
};
