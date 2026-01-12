/* eslint-disable @codaco/spellcheck/spell-checker */
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import { createHashHistory as createHistory } from 'history';
import { getEnv, isCordova } from '../utils/Environment';
import logger from './middleware/logger';
import sound from './middleware/sound';
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
  autoMergeLevel2,
  storage: getStorageEngine(),
  whitelist: [
    'deviceSettings',
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
    applyMiddleware(routerMiddleware(history), thunk, logger, sound),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
      ? window.devToolsExtension()
      : (f) => f,
  ),
);

persistor = persistStore(store, { manualPersist: true });

export { persistor };
