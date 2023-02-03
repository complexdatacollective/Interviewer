/*
 * Global UI state
 */

const initialState = {
  settingsMenuOpen: false,
};

const UPDATE = 'UI/UPDATE';
const TOGGLE = 'UI/TOGGLE';

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE:
      return {
        ...state,
        ...action.state,
      };
    case TOGGLE:
      return {
        ...state,
        [action.item]: !state[action.item],
      };
    default:
      return state;
  }
}

const update = (state) => ({
  type: UPDATE,
  state,
});

const toggle = (item) => ({
  type: TOGGLE,
  item,
});

const actionCreators = {
  update,
  toggle,
};

const actionTypes = {
  UPDATE,
  TOGGLE,
};

export {
  actionCreators,
  actionTypes,
};
