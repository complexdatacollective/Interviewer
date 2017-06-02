const RESET_STATE = 'RESET_STATE';
const TOGGLE_SESSION_MENU = 'TOGGLE_SESSION_MENU';
const TOGGLE_STAGE_MENU = 'TOGGLE_STAGE_MENU';
const UPDATE_STAGE_SEARCH = 'UPDATE_STAGE_SEARCH';

const initialState = {
  sessionMenuIsOpen: false,
  stageMenuIsOpen: false,
  stageSearchTerm: '',
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_SESSION_MENU: {
      return {
        ...state,
        sessionMenuIsOpen: !state.sessionMenuIsOpen,
      };
    }
    case TOGGLE_STAGE_MENU: {
      return {
        ...state,
        stageMenuIsOpen: !state.stageMenuIsOpen,
      };
    }
    case UPDATE_STAGE_SEARCH: {
      return {
        ...state,
        stageSearchTerm: action.searchTerm,
      };
    }
    default:
      return state;
  }
}

function resetState() {
  return {
    type: RESET_STATE,
  };
}

function toggleSessionMenu() {
  return {
    type: TOGGLE_SESSION_MENU,
  };
}

function toggleStageMenu() {
  return {
    type: TOGGLE_STAGE_MENU,
  };
}

function updateStageSearch(searchTerm) {
  return {
    type: UPDATE_STAGE_SEARCH,
    searchTerm,
  };
}

const actionCreators = {
  resetState,
  toggleSessionMenu,
  toggleStageMenu,
  updateStageSearch,
};

const actionTypes = {
  RESET_STATE,
  TOGGLE_SESSION_MENU,
  TOGGLE_STAGE_MENU,
  UPDATE_STAGE_SEARCH,
};

export {
  actionCreators,
  actionTypes,
};
