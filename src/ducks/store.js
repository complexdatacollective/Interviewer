import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createHashHistory';
import { getEnv } from '../utils/Environment';
import logger from './middleware/logger';
import epics from './middleware/epics';
import rootReducer from './modules/rootReducer';

const persistConfig = {
  key: 'networkCanvas',
  storage,
  whitelist: [
    'deviceSettings',
    'pairedServer',
    'installedProtocols',
    'router',
    'search',
    'activeSessionId',
    'sessions',
    'ui',
  ],
};

const env = getEnv();

export const history = createHistory();

const getReducer = () => {
  if (env.REACT_APP_NO_PERSIST) {
    return rootReducer;
  }

  return persistReducer(persistConfig, rootReducer);
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

export const persistor = persistStore(store);
