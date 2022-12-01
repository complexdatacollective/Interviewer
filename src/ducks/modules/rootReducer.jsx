import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import sessions from './sessions';
import activeSessionId from './session';
import activeSessionWorkers from './sessionWorkers';
import deviceSettings from './deviceSettings';
import installedProtocols from './installedProtocols';
import dialogs from './dialogs';
import toasts from './toasts';
import search from './search';
import ui from './ui';
import dismissedUpdates from './dismissedUpdates';
import pairedServer from './pairedServer';
import exportProgress from './exportProgress';
import { actionTypes as resetActionTypes } from './reset';

const appReducer = combineReducers({
  form: formReducer,
  activeSessionId,
  activeSessionWorkers,
  sessions,
  deviceSettings,
  installedProtocols,
  dialogs,
  toasts,
  search,
  ui,
  dismissedUpdates,
  pairedServer,
  exportProgress,
});

const rootReducer = (state, action) => {
  let currentState = state;

  if (action && action.type === resetActionTypes.RESET_STATE) {
    currentState = undefined;
  }

  return appReducer(currentState, action);
};

export default rootReducer;
