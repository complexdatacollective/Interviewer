import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createHashHistory';

import logger from './middleware/logger';
import epics from './middleware/epics';
import rootReducer from './modules/rootReducer';

const persistConfig = {
  key: 'root',
  storage,
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

export const history = createHistory();

// export const store = createStore(
//   rootReducer,
//   undefined,
//   compose(
//     autoRehydrate(),
//     applyMiddleware(routerMiddleware(history), thunk, epics, logger),
//     typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
//       ? window.devToolsExtension()
//       : f => f,
//   ),
// );

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(
  persistedReducer,
  undefined,
  compose(
    applyMiddleware(routerMiddleware(history), thunk, epics, logger),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
      ? window.devToolsExtension()
      : f => f,
  ),
);

export const persistor = persistStore(store);
