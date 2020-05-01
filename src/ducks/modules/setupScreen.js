const UPDATE = 'SETUP-SCREEN/UPDATE';
const TOGGLE = 'SETUP-SCREEN/TOGGLE';

const initialState = {
  activeProtocolUUID: null,
  showWelcomeMessage: false,
  protocolsOverlaySortProperty: 'name',
  protocolsOverlaySortDirection: 'asc',
  sessionsOverlaySortProperty: 'last_changed',
  sessionsOverlaySortDirection: 'desc',
};

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

const update = state => ({
  type: UPDATE,
  state,
});

const toggle = item => ({
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
