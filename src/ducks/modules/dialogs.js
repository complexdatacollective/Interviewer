const REGISTER_DIALOG = 'REGISTER_DIALOG';
const UNREGISTER_DIALOG = 'UNREGISTER_DIALOG';
const TOGGLE_DIALOG = 'TOGGLE_DIALOG';
const OPEN_DIALOG = 'OPEN_DIALOG';
const CLOSE_DIALOG = 'CLOSE_DIALOG';

const initialState = [];

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case REGISTER_DIALOG:
      return [
        ...state.filter(modal => modal.name !== action.name),
        { name: action.name, open: false },
      ];
    case UNREGISTER_DIALOG:
      return state.filter(modal => modal.name !== action.name);
    case TOGGLE_DIALOG:
      return state.map((modal) => {
        if (modal.name !== action.name) { return modal; }
        return {
          ...modal,
          open: !modal.open,
        };
      });
    case OPEN_DIALOG:
      return state.map((modal) => {
        if (modal.name !== action.name) { return modal; }
        return {
          ...modal,
          open: true,
        };
      });
    case CLOSE_DIALOG:
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

function toggleDialog(name) {
  return {
    type: TOGGLE_DIALOG,
    name,
  };
}

function openDialog(name) {
  return {
    type: OPEN_DIALOG,
    name,
  };
}

function closeDialog(name) {
  return {
    type: CLOSE_DIALOG,
    name,
  };
}

function registerDialog(name) {
  return {
    type: REGISTER_DIALOG,
    name,
  };
}

function unregisterDialog(name) {
  return {
    type: UNREGISTER_DIALOG,
    name,
  };
}

const actionCreators = {
  toggleDialog,
  openDialog,
  closeDialog,
  registerDialog,
  unregisterDialog,
};

const actionTypes = {
  TOGGLE_DIALOG,
  OPEN_DIALOG,
  CLOSE_DIALOG,
  REGISTER_DIALOG,
  UNREGISTER_DIALOG,
};

const modalNames = {
  EDIT_NODE: 'EDIT_NODE',
  ADD_NODE: 'ADD_NODE',
};

export {
  actionCreators,
  actionTypes,
  modalNames,
};
