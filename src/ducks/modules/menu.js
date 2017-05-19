const TOGGLE_MENU = 'TOGGLE_MENU';

const initialState = {
  menuIsOpen: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_MENU: {
      return {
        ...state,
        menuIsOpen: !state.menuIsOpen,
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

const actionCreators = {
  toggleMenu,
};

const actionTypes = {
  TOGGLE_MENU,
};

export {
  actionCreators,
  actionTypes,
};
