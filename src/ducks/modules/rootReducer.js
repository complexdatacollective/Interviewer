import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import network from './network';
import participant from './participant';
import protocol from './protocol';
import session from './session';
import modals from './modals';
import menu from './menu';
import errors from './errors';
import search from './search';

const appReducer = combineReducers({
  form: formReducer,
  network,
  participant,
  protocol,
  session,
  modals,
  menu,
  errors,
  search,
});

const rootReducer = (state, action) => {
  let currentState = state;

  if (action.type === 'RESET_STATE') {
    currentState = undefined;
  }

  return appReducer(currentState, action);
};

export default rootReducer;
