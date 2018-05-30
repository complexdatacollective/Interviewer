import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import session from './session';
import sessions from './sessions';
import protocol from './protocol';
import protocols from './protocols';
import modals from './modals';
import menu from './menu';
import errors from './errors';
import search from './search';

const appReducer = combineReducers({
  router: routerReducer,
  form: formReducer,
  session,
  sessions,
  protocol,
  protocols,
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
