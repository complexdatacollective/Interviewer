import uuid from 'uuid';
import React from 'react';

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
      return [
        ...state,
        { ...action.toast },
      ];
    case UPDATE_TOAST: {
      return [
        ...state.map((toast) => {
          if (toast.id !== action.id) { return toast; }
          return {
            ...toast,
            ...action.toast,
          };
        }),
      ];
    }
    case REMOVE_TOAST:
      return [
        ...state.filter((toast) => toast.id !== action.id),
      ];
    default:
      return state;
  }
}

const withToast = (actionCreator) => (...args) => (dispatch) => {
  const action = actionCreator(...args);
  dispatch(action);
  switch (action.type) {
    case 'SET_SERVER': {
      return dispatch(addToast({
        type: 'success',
        title: 'Pairing complete!',
        content: (
          <p>
            You have successfully paired with Server. You may now fetch protocols
            and upload data.
          </p>
        ),
      }));
    }
    default:
      return null;
  }
};

const actionCreators = {
  addToast,
  updateToast,
  removeToast,
};

const actionTypes = {
  ADD_TOAST,
  REMOVE_TOAST,
};

export {
  actionCreators,
  actionTypes,
  withToast,
};

export default reducer;
