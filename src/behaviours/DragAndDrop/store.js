import { throttle } from 'lodash';
import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducer';

const store = createStore(
  reducer,
  applyMiddleware(thunk),
);

export default store;
