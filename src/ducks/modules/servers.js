/* eslint-disable */

import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs';
import { unionWith } from 'lodash';
import { actionCreators as errorActions } from './errors';
import friendlyErrorMessage from '../../utils/friendlyErrorMessage';
import ServerDiscoverer from '../../utils/serverDiscoverer';

const SERVICE_ANNOUNCED = Symbol('SERVERS/SERVICE_ANNOUNCED');
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
    case SERVICE_REMOVED:
      return {
        ...state,
        services: [...state.services].splice(state.services.indexOf(action.service), 1),
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

const serviceRemoved = service => ({
  type: SERVICE_REMOVED,
  service,
});

const discoveryError = friendlyErrorMessage('Server discovery went bad x_x  ');

const serverDiscoveryThunk = () => {

  const serverDiscoverer = new ServerDiscoverer();

  return function (dispatch) {
    serverDiscoverer.on('SERVER_SERVICE_ANNOUNCED', service => dispatch(serviceAnnounced(service)));
    serverDiscoverer.on('SERVER_SERVICE_REMOVED', service => dispatch(serviceRemoved(service)));
    serverDiscoverer.on('SERVER_SERVICE_ERROR', error => dispatch(errorActions.error(discoveryError(error))));
  };

};

const actionCreators = {
  serviceAnnounced,
  serviceRemoved,
  serverDiscoveryThunk
};

const actionTypes = {
  SERVICE_ANNOUNCED,
  SERVICE_REMOVED,
};

export {
  actionCreators,
  actionTypes,
};
