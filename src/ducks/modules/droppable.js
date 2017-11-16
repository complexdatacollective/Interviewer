import { reject, isEqual } from 'lodash';
import { actionTypes as draggableActions } from './draggable';

const UPDATE_ZONE = 'UPDATE_ZONE';
const UPDATE_ACTIVE_ZONES = 'UPDATE_ACTIVE_ZONES';
const UPDATE_ACCEPTED_TYPE = 'UPDATE_ACCEPTED_TYPE';

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
    case UPDATE_ACTIVE_ZONES:
      return isEqual(action.zones, state.activeZones) ?
        state :
        ({
          ...state,
          activeZones: action.zones,
        });
    case UPDATE_ACCEPTED_TYPE: {
      const oldZone = state.zones.find(zone => zone.name === action.name);
      oldZone.acceptsDraggableType = action.acceptedType;
      const zones = [...reject(state.zones, ['name', action.name]), oldZone];
      return {
        ...state,
        zones,
      };
    }
    case draggableActions.DRAG_STOP:
      return {
        ...state,
        activeZones: [],
      };
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

function updateAcceptedType(name, acceptedType) {
  return {
    type: UPDATE_ACCEPTED_TYPE,
    name,
    acceptedType,
  };
}

const actionCreators = {
  updateZone,
  updateActiveZones,
  updateAcceptedType,
};

const actionTypes = {
  UPDATE_ZONE,
  UPDATE_ACTIVE_ZONES,
  UPDATE_ACCEPTED_TYPE,
};

export {
  actionCreators,
  actionTypes,
};
