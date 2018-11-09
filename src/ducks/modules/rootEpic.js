import { combineEpics } from 'redux-observable';
import { epics as protocolEpics } from './protocol';
import { epics as sessionsEpics } from './sessions';
import { epics as errorEpics } from './errors';

export default combineEpics(
  protocolEpics,
  sessionsEpics,
  errorEpics,
);
