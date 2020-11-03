import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import { createHashHistory as createHistory } from 'history';
import { getEnv } from '../utils/Environment';
import logger from './middleware/logger';
import epics from './middleware/epics';
import createRootReducer from './modules/rootReducer';

const persistConfig = {
  key: 'networkCanvas6',
  storage,
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

export const persistor = persistStore(store);
