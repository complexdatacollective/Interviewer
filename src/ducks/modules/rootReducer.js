import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import network from './network';
import page from './page';
import participant from './participant';
import protocol from './protocol';
import session from './session';
import droppable from './droppable';
import modals from './modals';

export default function(persistor) {
  return combineReducers({
      form: formReducer,
      network,
      page,
      participant,
      protocol: protocol(persistor),
      session,
      droppable,
      modals,
  })
};
