
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import logger from './middleware/logger';
import rootReducer from './modules/rootReducer';

export const store = createStore(
  rootReducer,
  undefined,
  compose(
    applyMiddleware(thunk, logger),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
      ? window.devToolsExtension()
      : (f) => f,
  ),
);
