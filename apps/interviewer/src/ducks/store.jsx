import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import logger from './middleware/logger';
import rootReducer from './modules/rootReducer';
import { apiSlice } from '../slices/api.slice';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk, logger, apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});
