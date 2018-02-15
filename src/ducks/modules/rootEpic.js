import { combineEpics } from 'redux-observable';
import { epics as protocolEpics } from './protocol';
import { epics as serversEpics } from './servers';

export default combineEpics(
  protocolEpics,
  serversEpics,
);
