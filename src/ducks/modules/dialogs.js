import uuid from 'uuid';

const OPEN_DIALOG = Symbol('PROTOCOL/OPEN_DIALOG');
const CLOSE_DIALOG = Symbol('PROTOCOL/CLOSE_DIALOG');

// TODO: remove these examples!
const initialState = {
  dialogs: [
    // {
    //   id: '1234-1234-1',
    //   type: 'Confirm',
    //   title: 'Something to confirm',
    //   message: 'More detail about confirmation',
    //   confirmLabel: 'Yes please!',
    //   onConfirm: () => {},
    //   onCancel: () => {},
    // },
    // {
    //   id: '1234-1234-2',
    //   type: 'Notice',
    //   title: 'Something info for the user',
    //   message: 'More detail...',
    //   onConfirm: () => {},
    // },
    // {
    //   id: '1234-1234-3',
    //   type: 'Warning',
    //   title: 'Something to warn the user about, maybe a non-failing error',
    //   message: 'More detail...',
    //   onConfirm: () => {},
    // },
    // {
    //   id: '1234-1234-4',
    //   type: 'Error',
    //   error: new Error('message and title are automatic'),
    //   onConfirm: () => {},
    //   onCancel: () => {},
    // },
  ],
};

const openDialog = (dialog) => (dispatch) => new Promise((resolve) => {
  const onConfirm = () => {
    if (dialog.onConfirm) { dialog.onConfirm(); }
    resolve(true);
  };

  const onCancel = () => {
    if (dialog.onCancel) { dialog.onCancel(); }
    resolve(false);
  };

  dispatch({
    id: uuid(),
    type: OPEN_DIALOG,
    dialog: {
      ...dialog,
      onConfirm,
      onCancel,
    },
  });
});

const closeDialog = (id) => ({
  type: CLOSE_DIALOG,
  id,
});

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case OPEN_DIALOG:
      return {
        ...state,
        dialogs: [
          ...state.dialogs,
          { id: action.id, ...action.dialog },
        ],
      };
    case CLOSE_DIALOG:
      return {
        ...state,
        dialogs: state.dialogs.filter((dialog) => dialog.id !== action.id),
      };
    default:
      return state;
  }
}

const actionCreators = {
  openDialog,
  closeDialog,
};

const actionTypes = {
  OPEN_DIALOG,
  CLOSE_DIALOG,
};

export {
  actionCreators,
  actionTypes,
};

export default reducer;
