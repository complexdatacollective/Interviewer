import { combineEpics } from 'redux-observable';
import { epics as errorEpics } from './errors';
import { epics as toastsEpics } from './toastsEpic';

export default combineEpics(
  errorEpics,
  toastsEpics,
);
