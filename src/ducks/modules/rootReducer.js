import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import externalData from './externalData';
import sessions from './sessions';
import session from './session';
import device from './device';
import protocol from './protocol';
import protocols from './protocols';
import modals from './modals';
import menu from './menu';
import errors from './errors';
import search from './search';
import pairedServer from './pairedServer';

const appReducer = combineReducers({
  router: routerReducer,
  form: formReducer,
  session,
  sessions,
  device,
  externalData,
  protocol,
  protocols,
  modals,
  menu,
  errors,
  search,
  pairedServer,
});

const rootReducer = (state, action) => {
  let currentState = state;

  if (action.type === 'RESET_STATE') {
    currentState = undefined;
  }

  return appReducer(currentState, action);
};

export default rootReducer;
