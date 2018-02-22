/* eslint-disable */

import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { unionWith } from 'lodash';
import { friendlyErrorMessage, actionCreators as errorActions } from './errors';
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
        services: [...state.services, action.service],
      };
    case SERVICE_RESOLVED:
      return {
        ...state,
        services: unionWith([action.service], state.services, service => service.interfaceIndex),
      };
    case SERVICE_REMOVED:
      return {
        ...state,
        services: [...state.services].splice(action.service.interfaceIndex, 1),
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

const fromEventEmitter = (emitter, eventName) =>
  Observable.fromEventPattern(
    handler => emitter.on(eventName, handler),
    handler => emitter.removeListener(eventName, handler)
  );

const discoveryError = friendlyErrorMessage('Server discovery went bad x_x');

const serverDiscoveryEpic = () => {
  const serverDiscoverer = new ServerDiscoverer();

  return Observable.merge(
    fromEventEmitter(serverDiscoverer, 'SERVICE_ANNOUNCED').map(service => serviceAnnounced(service)),
    fromEventEmitter(serverDiscoverer, 'SERVICE_RESOLVED').map(service => serviceResolved(service)),
    fromEventEmitter(serverDiscoverer, 'SERVICE_REMOVED').map(service => serviceRemoved(service)),
    fromEventEmitter(serverDiscoverer, 'ERROR').map(error => errorActions.error(discoveryError(error))),
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
