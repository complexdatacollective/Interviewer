import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import externalData from './externalData';
import sessions from './sessions';
import session from './session';
import device from './device';
import protocol from './protocol';
import protocols from './protocols';
import dialogs from './dialogs';
import errors from './errors';
import search from './search';
import ui from './ui';
import pairedServer from './pairedServer';

const RESET_STATE = 'RESET_STATE';

const resetState = () => ({
  type: RESET_STATE,
});

const appReducer = combineReducers({
  router: routerReducer,
  form: formReducer,
  session,
  sessions,
  device,
  externalData,
  protocol,
  protocols,
  dialogs,
  errors,
  search,
  ui,
  pairedServer,
});

const rootReducer = (state, action) => {
  let currentState = state;

  if (action.type === RESET_STATE) {
    currentState = undefined;
  }

  return appReducer(currentState, action);
};

export const actionCreators = {
  resetState,
};

export const actionTypes = {
  RESET_STATE,
};

export default rootReducer;
