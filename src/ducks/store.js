import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import { createHashHistory as createHistory } from 'history';
import { getEnv } from '../utils/Environment';
import logger from './middleware/logger';
import epics from './middleware/epics';
import rootReducer from './modules/rootReducer';

const persistConfig = {
  key: 'networkCanvas',
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: [
    'deviceSettings',
    'pairedServer',
    'installedProtocols',
    'router',
    'search',
    'activeSessionId',
    'sessions',
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
  {
    booboo: 213,
  },
  compose(
    applyMiddleware(routerMiddleware(history), thunk, epics, logger),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
      ? window.devToolsExtension()
      : f => f,
  ),
);

export const persistor = persistStore(store);
