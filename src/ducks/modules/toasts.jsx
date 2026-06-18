import { v4 as uuid } from 'uuid';

const ADD_TOAST = 'TOASTS/ADD_TOAST';
const UPDATE_TOAST = 'TOASTS/UPDATE_TOAST';
const REMOVE_TOAST = 'TOASTS/REMOVE_TOAST';

const initialState = [];

const addToast = (toast) => (dispatch) => {
  const id = toast.id || uuid();
  dispatch({
    type: ADD_TOAST,
    toast: {
      ...toast,
      id,
    },
  });

  return id;
};

const updateToast = (id, toast) => ({
  type: UPDATE_TOAST,
  id,
  toast,
});

const removeToast = (id) => ({
  type: REMOVE_TOAST,
  id,
});

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_TOAST:
      return [...state, { ...action.toast }];
    case UPDATE_TOAST: {
      return state.map((toast) => {
        if (toast.id !== action.id) {
          return toast;
        }
        return {
          ...toast,
          ...action.toast,
        };
      });
    }
    case REMOVE_TOAST:
      return state.filter((toast) => toast.id !== action.id);
    default:
      return state;
  }
}

const actionCreators = {
  addToast,
  updateToast,
  removeToast,
};

export { actionCreators };

export default reducer;
