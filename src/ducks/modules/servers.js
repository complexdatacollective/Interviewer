import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import ServerDiscoverer from '../../utils/serverDiscoverer';

const SERVICE_ANNOUNCED = 'SERVERS/SERVICE_ANNOUNCED';
const SERVICE_RESOLVED = Symbol('SERVERS/SERVICE_RESOLVED');
const SERVICE_REMOVED = 'SERVERS/SERVICE_REMOVED';

const initialState = {

};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SERVICE_ANNOUNCED:
    case SERVICE_RESOLVED:
    case SERVICE_REMOVED:
    default:
      return state;
  }
}

const serviceAnnounced = () => ({
  type: SERVICE_ANNOUNCED,
});

const serviceResolved = () => ({
  type: SERVICE_RESOLVED,
});

const serviceRemoved = () => ({
  type: SERVICE_REMOVED,
});

const serverDiscoveryEpic = () => {
  const serverDiscoverer = new ServerDiscoverer();

  return Observable.merge(
    Observable.fromEvent(serverDiscoverer, 'SERVICE_ANNOUNCED').map((...args) => serviceAnnounced(args)),
    Observable.fromEvent(serverDiscoverer, 'SERVICE_RESOLVED').map((...args) => serviceResolved(args)),
    Observable.fromEvent(serverDiscoverer, 'SERVICE_REMOVED').map((...args) => serviceRemoved(args)),
  );
};

const actionCreators = {
  serviceAnnounced,
  serviceResolved,
  serviceRemoved,
};

const actionTypes = {
  SERVICE_ANNOUNCED,
  SERVICE_RESOLVED,
  SERVICE_REMOVED,
};

const epics = combineEpics(
  serverDiscoveryEpic,
);

export {
  actionCreators,
  actionTypes,
  epics,
};
