const OPEN_SEARCH = 'OPEN_SEARCH';
const CLOSE_SEARCH = 'CLOSE_SEARCH';

const initialState = {
  collapsed: true,
  selectedResults: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    // TODO: decide on interface based on other components
    // case TOGGLE_SEARCH:
    case OPEN_SEARCH:
      // fallthrough
    case CLOSE_SEARCH:
      return {
        ...state,
        collapsed: !state.collapsed,
        selectedResults: [],
      };
    default:
      return state;
  }
}

function openSearch() {
  return {
    type: OPEN_SEARCH,
  };
}

function closeSearch() {
  return {
    type: CLOSE_SEARCH,
  };
}

const actionCreators = {
  openSearch,
  closeSearch,
};

export {
  actionCreators,
};
