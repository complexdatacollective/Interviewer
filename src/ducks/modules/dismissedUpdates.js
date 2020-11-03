import { omit, get } from 'lodash';

const SET_PROPERTY = 'DISMISSED_UPDATES/SET_PROPERTY';
const TOGGLE_PROPERTY = 'DISMISSED_UPDATES/TOGGLE_PROPERTY';
const CLEAR_PROPERTY = 'DISMISSED_UPDATES/CLEAR_PROPERTY';

const initialState = {
};

const setProperty = (key, value) => ({
  type: SET_PROPERTY,
  payload: {
    key,
    value,
  },
});

const clearProperty = key => ({
  type: CLEAR_PROPERTY,
  payload: {
    key,
  },
});

const toggleProperty = key => ({
  type: TOGGLE_PROPERTY,
  payload: {
    key,
  },
});

export default (state = initialState, { type, payload } = { type: null, payload: null }) => {
  switch (type) {
    case SET_PROPERTY:
      return {
        ...state,
        [payload.key]: payload.value,
      };
    case CLEAR_PROPERTY: {
      return omit(state, payload.key);
    }
    case TOGGLE_PROPERTY:
      return {
        ...state,
        [payload.key]: !state[payload.key],
      };
    default:
      return state;
  }
};

const getProperty = key =>
  state => get(state, ['dismissedUpdates', key]);

export const selectors = {
  getProperty,
};

export const actionTypes = {
  SET_PROPERTY,
  TOGGLE_PROPERTY,
  CLEAR_PROPERTY,
};

export const actionCreators = {
  setProperty,
  toggleProperty,
  clearProperty,
};
