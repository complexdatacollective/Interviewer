import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import ServerDiscoverer from '../../utils/serverDiscoverer';

const SERVICE_ANNOUNCED = Symbol('SERVERS/SERVICE_ANNOUNCED');
const SERVICE_RESOLVED = Symbol('SERVERS/SERVICE_RESOLVED');
const SERVICE_REMOVED = Symbol('SERVERS/SERVICE_REMOVED');

const initialState = {
  services: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SERVICE_ANNOUNCED:
      return {
        ...state,
        services: [...state.services].splice(action.service.serviceIndex, 1, action.service),
      };
    case SERVICE_RESOLVED:
      return {
        ...state,
        services: [...state.services].splice(action.service.serviceIndex, 1, action.service),
      };
    case SERVICE_REMOVED:
      return {
        ...state,
        services: [...state.services].splice(action.service.serviceIndex, 1),
      };
    default:
      return state;
  }
}

const serviceAnnounced = service => ({
  type: SERVICE_ANNOUNCED,
  service: {
    ...service,
    status: 'ANNOUNCED',
  },
});

const serviceResolved = service => ({
  type: SERVICE_RESOLVED,
  service: {
    ...service,
    status: 'RESOLVED',
  },
});

const serviceRemoved = service => ({
  type: SERVICE_REMOVED,
  service,
});

const serverDiscoveryEpic = () => {
  const serverDiscoverer = new ServerDiscoverer();

  return Observable.merge(
    Observable.fromEvent(serverDiscoverer, 'SERVICE_ANNOUNCED').map(service => serviceAnnounced(service)),
    Observable.fromEvent(serverDiscoverer, 'SERVICE_RESOLVED').map(service => serviceResolved(service)),
    Observable.fromEvent(serverDiscoverer, 'SERVICE_REMOVED').map(service => serviceRemoved(service)),
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
