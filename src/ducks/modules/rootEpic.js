import { combineEpics } from 'redux-observable';
import { epics as protocolEpics } from './protocol';

export default combineEpics(
  protocolEpics,
);
