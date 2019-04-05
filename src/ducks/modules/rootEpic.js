import { combineEpics } from 'redux-observable';
import { epics as sessionsEpics } from './sessions';
import { epics as errorEpics } from './errors';

export default combineEpics(
  sessionsEpics,
  errorEpics,
);
