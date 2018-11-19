import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import externalData from './externalData';
import sessions from './sessions';
import session from './session';
import deviceSettings from './deviceSettings';
import protocol from './protocol';
import protocols from './protocols';
import dialogs from './dialogs';
import search from './search';
import ui from './ui';
import pairedServer from './pairedServer';
import { actionTypes as resetActionTypes } from './reset';

const appReducer = combineReducers({
  router: routerReducer,
  form: formReducer,
  session,
  sessions,
  deviceSettings,
  externalData,
  protocol,
  protocols,
  dialogs,
  search,
  ui,
  pairedServer,
});

const rootReducer = (state, action) => {
  let currentState = state;

  if (action.type === resetActionTypes.RESET_STATE) {
    currentState = undefined;
  }

  return appReducer(currentState, action);
};

export default rootReducer;
