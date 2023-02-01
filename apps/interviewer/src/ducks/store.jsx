
import { configureStore } from '@reduxjs/toolkit';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import logger from './middleware/logger';
import rootReducer from './modules/rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk, logger),
  devTools: process.env.NODE_ENV !== 'production',
});
