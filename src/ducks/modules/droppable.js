import { reject } from 'lodash';

const UPDATE_ZONE = 'UPDATE_ZONE';
const UPDATE_ACTIVE_ZONES = 'UPDATE_ACTIVE_ZONES';

const initialState = {
  zones: [],
  activeZones: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_ZONE: {
      const zones = [...reject(state.zones, ['name', action.zone.name]), action.zone];
      return {
        ...state,
        zones,
      };
    }
    case UPDATE_ACTIVE_ZONES: {
      return {
        ...state,
        activeZones: action.zones,
      };
    }
    default:
      return state;
  }
}

function updateZone(zone) {
  return {
    type: UPDATE_ZONE,
    zone,
  };
}

function updateActiveZones(zones) {
  return {
    type: UPDATE_ACTIVE_ZONES,
    zones,
  };
}

const actionCreators = {
  updateZone,
  updateActiveZones,
};

const actionTypes = {
  UPDATE_ZONE,
  UPDATE_ACTIVE_ZONES,
};

export {
  actionCreators,
  actionTypes,
};
