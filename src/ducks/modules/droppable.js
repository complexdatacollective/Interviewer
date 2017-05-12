import { reject } from 'lodash';

const UPDATE_ZONE = 'UPDATE_ZONE';

const initialState = {
  zones: [],
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

const actionCreators = {
  updateZone,
};

const actionTypes = {
  UPDATE_ZONE,
};

export {
  actionCreators,
  actionTypes,
};
