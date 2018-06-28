import { combineEpics } from 'redux-observable';
import { epics as protocolEpics } from './protocol';
import { epics as sessionsEpics } from './sessions';

export default combineEpics(
  protocolEpics,
  sessionsEpics,
);
