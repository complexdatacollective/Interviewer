const TOGGLE_MENU = 'TOGGLE_MENU';
const UPDATE_SEARCH = 'UPDATE_SEARCH';

const initialState = {
  menuIsOpen: false,
  searchTerm: '',
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_MENU: {
      return {
        ...state,
        menuIsOpen: !state.menuIsOpen,
      };
    }
    case UPDATE_SEARCH: {
      return {
        ...state,
        searchTerm: action.searchTerm,
      };
    }
    default:
      return state;
  }
}

function toggleMenu() {
  return {
    type: TOGGLE_MENU,
  };
}

function updateSearch(searchTerm) {
  return {
    type: UPDATE_SEARCH,
    searchTerm,
  };
}

const actionCreators = {
  toggleMenu,
  updateSearch,
};

const actionTypes = {
  TOGGLE_MENU,
  UPDATE_SEARCH,
};

export {
  actionCreators,
  actionTypes,
};
