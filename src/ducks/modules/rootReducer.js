import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import deviceSettings from './deviceSettings';
import dialogs from './dialogs';
import dismissedUpdates from './dismissedUpdates';
import exportProgress from './exportProgress';
import installedProtocols from './installedProtocols';
import { actionTypes as resetActionTypes } from './reset';
import search from './search';
import activeSessionId from './session';
import sessions from './sessions';
import activeSessionWorkers from './sessionWorkers';
import toasts from './toasts';
import ui from './ui';

const appReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
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
    exportProgress,
  });

const createRootReducer = (history) => (state, action) => {
  let currentState = state;

  if (action && action.type === resetActionTypes.RESET_STATE) {
    currentState = undefined;
  }

  return appReducer(history)(currentState, action);
};

export default createRootReducer;
