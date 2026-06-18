const OPEN_SEARCH = 'OPEN_SEARCH';
const CLOSE_SEARCH = 'CLOSE_SEARCH';
const TOGGLE_SEARCH = 'TOGGLE_SEARCH';

const initialState = {
  collapsed: true,
  selectedResults: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_SEARCH:
      return {
        ...state,
        collapsed: !state.collapsed,
        selectedResults: [],
      };
    case OPEN_SEARCH:
      return {
        ...state,
        collapsed: false,
        selectedResults: [],
      };
    case CLOSE_SEARCH:
      return {
        ...state,
        collapsed: true,
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

function toggleSearch() {
  return {
    type: TOGGLE_SEARCH,
  };
}

const actionCreators = {
  closeSearch,
  openSearch,
  toggleSearch,
};

const actionTypes = {
  CLOSE_SEARCH,
  OPEN_SEARCH,
  TOGGLE_SEARCH,
};

export { actionCreators, actionTypes };
