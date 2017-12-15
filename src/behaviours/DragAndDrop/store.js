import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer, { actionTypes } from './reducer';

const logger = store => next => (action) => {
  const result = next(action);

  switch (action.type) {
    case actionTypes.UPDATE_TARGET:
      break;
    default: {
      console.log('dispatching', action);
      console.log('next state', store.getState());
    }
  }

  return result;
};

const store = createStore(
  reducer,
  applyMiddleware(thunk, logger),
);

export default store;
