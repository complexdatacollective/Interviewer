import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import network from './network';
import page from './page';
import participant from './participant';
import protocol from './protocol';
import session from './session';
import draggable from './draggable';
import droppable from './droppable';
import modals from './modals';
import menu from './menu';

const appReducer = combineReducers({
  form: formReducer,
  network,
  page,
  participant,
  protocol,
  session,
  draggable,
  droppable,
  modals,
  menu,
});

const rootReducer = (state, action) => {
  let currentState = state;

  if (action.type === 'RESET_STATE') {
    currentState = undefined;
  }

  return appReducer(currentState, action);
};

export default rootReducer;
