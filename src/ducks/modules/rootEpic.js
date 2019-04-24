import { combineEpics } from 'redux-observable';
import { epics as errorEpics } from './errors';

export default combineEpics(
  errorEpics,
);
