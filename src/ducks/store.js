import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import thunk from 'redux-thunk';
import logger from './middleware/logger';
import epics from './middleware/epics';
import rootReducer from './modules/rootReducer';

export const store = createStore(
  rootReducer,
  undefined,
  compose(
    autoRehydrate(),
    applyMiddleware(thunk, epics, logger),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
      ? window.devToolsExtension()
      : f => f,
  ),
);

export const persistor = persistStore(store, { blacklist: ['form', 'droppable', 'modals', 'session', 'protocol'] });
