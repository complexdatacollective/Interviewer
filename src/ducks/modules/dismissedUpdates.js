import { get } from '../../utils/lodash-replacements';

const DISMISS_UPDATE = 'DISMISSED_UPDATES/DISMISS_UPDATE';
const RESET = 'DISMISSED_UPDATES/RESET';

const initialState = [];

const dismissUpdate = (version) => ({
  type: DISMISS_UPDATE,
  payload: {
    version,
  },
});

export default (state = initialState, { type, payload } = { type: null, payload: null }) => {
  switch (type) {
    case DISMISS_UPDATE:
      return [
        ...state,
        payload.version,
      ];
    case RESET:
      return initialState;
    default:
      return state;
  }
};

const getDismissedUpdates = () => (state) => get(state, 'dismissedUpdates');

export const selectors = {
  getDismissedUpdates,
};

export const actionTypes = {
  DISMISS_UPDATE,
  RESET,
};

export const actionCreators = {
  dismissUpdate,
};
