import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import thunk from 'redux-thunk';
import logger from './middleware/logger';

import rootReducer from './modules/rootReducer';

export const store = createStore(
    rootReducer(persistor),
    undefined,
    compose(
        autoRehydrate(),
        applyMiddleware(thunk, logger),
        typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
          ? window.devToolsExtension()
          : f => f
    )
);

// eslint-disable-next-line
export const persistor = persistStore(store, { blacklist: ['form']});
