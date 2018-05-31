const REGISTER_MENU_ITEM = 'REGISTER_MENU_ITEM';
const RESET_STATE = 'RESET_STATE';
const TOGGLE_SETTINGS_MENU = 'TOGGLE_SETTINGS_MENU';
const TOGGLE_STAGE_MENU = 'TOGGLE_STAGE_MENU';
const UPDATE_STAGE_SEARCH = 'UPDATE_STAGE_SEARCH';
const UNREGISTER_MENU_ITEM = 'UNREGISTER_MENU_ITEM';

const initialState = {
  customMenuItems: [],
  settingsMenuIsOpen: false,
  stageMenuIsOpen: false,
  stageSearchTerm: '',
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REGISTER_MENU_ITEM: {
      return {
        ...state,
        customMenuItems: state.customMenuItems.concat(action.menuItem),
      };
    }
    case TOGGLE_SETTINGS_MENU: {
      return {
        ...state,
        settingsMenuIsOpen: !state.settingsMenuIsOpen,
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
    case UNREGISTER_MENU_ITEM: {
      return {
        ...state,
        customMenuItems: state.customMenuItems.filter(item => item.id !== action.id),
      };
    }
    default:
      return state;
  }
}

function registerMenuItem(menuItem) {
  return {
    type: REGISTER_MENU_ITEM,
    menuItem,
  };
}

function resetState() {
  return {
    type: RESET_STATE,
  };
}

function toggleSettingsMenu() {
  return {
    type: TOGGLE_SETTINGS_MENU,
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

function unregisterMenuItem(id) {
  return {
    type: UNREGISTER_MENU_ITEM,
    id,
  };
}

const actionCreators = {
  registerMenuItem,
  resetState,
  toggleSettingsMenu,
  toggleStageMenu,
  updateStageSearch,
  unregisterMenuItem,
};

const actionTypes = {
  REGISTER_MENU_ITEM,
  RESET_STATE,
  TOGGLE_SETTINGS_MENU,
  TOGGLE_STAGE_MENU,
  UPDATE_STAGE_SEARCH,
  UNREGISTER_MENU_ITEM,
};

export {
  actionCreators,
  actionTypes,
};
