import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import network from './network';
import page from './page';
import participant from './participant';

export default combineReducers({
    form: formReducer,
    network,
    page,
    participant
})
