const REGISTER_MODAL = 'REGISTER_MODAL';
const UNREGISTER_MODAL = 'UNREGISTER_MODAL';
const TOGGLE_MODAL = 'TOGGLE_MODAL';
const OPEN_MODAL = 'OPEN_MODAL';
const CLOSE_MODAL = 'CLOSE_MODAL';

const initialState = [];

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REGISTER_MODAL:
      return [
        ...state.filter(modal => modal.name !== action.name),
        { name: action.name, open: false },
      ];
    case UNREGISTER_MODAL:
      return state.filter(modal => modal.name !== action.name);
    case TOGGLE_MODAL:
      return state.map((modal) => {
        if (modal.name !== action.name) { return modal; }
        return {
          ...modal,
          open: !modal.open,
        };
      });
    case OPEN_MODAL:
      return state.map((modal) => {
        if (modal.name !== action.name) { return modal; }
        return {
          ...modal,
          open: true,
        };
      });
    case CLOSE_MODAL:
      return state.map((modal) => {
        if (modal.name !== action.name) { return modal; }
        return {
          ...modal,
          open: false,
        };
      });
    default:
      return state;
  }
}

function toggleModal(name) {
  return {
    type: TOGGLE_MODAL,
    name,
  };
}

function openModal(name) {
  return {
    type: OPEN_MODAL,
    name,
  };
}

function closeModal(name) {
  return {
    type: CLOSE_MODAL,
    name,
  };
}

function registerModal(name) {
  return {
    type: REGISTER_MODAL,
    name,
  };
}

function unregisterModal(name) {
  return {
    type: UNREGISTER_MODAL,
    name,
  };
}

const actionCreators = {
  toggleModal,
  openModal,
  closeModal,
  registerModal,
  unregisterModal,
};

const actionTypes = {
  TOGGLE_MODAL,
  OPEN_MODAL,
  CLOSE_MODAL,
  REGISTER_MODAL,
  UNREGISTER_MODAL,
};

export {
  actionCreators,
  actionTypes,
};
