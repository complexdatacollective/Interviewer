/* eslint-disable @codaco/spellcheck/spell-checker */
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import { createHashHistory as createHistory } from 'history';
import { getEnv, isCordova } from '../utils/Environment';
import logger from './middleware/logger';
import createRootReducer from './modules/rootReducer';
import { localStorageEngine, sqliteStorageEngine } from '../utils/storageAdapters';

// eslint-disable-next-line import/no-mutable-exports
let persistor;

const getStorageEngine = () => {
  const onPersistReady = () => {
    persistor.persist();
  };

  if (isCordova()) {
    return sqliteStorageEngine(onPersistReady);
  }

  return localStorageEngine(onPersistReady);
};

const persistConfig = {
  key: 'networkCanvas6',
  storage: getStorageEngine(),
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
    applyMiddleware(routerMiddleware(history), thunk, logger),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
      ? window.devToolsExtension()
      : (f) => f,
  ),
);

persistor = persistStore(store, { manualPersist: true });

export { persistor };
