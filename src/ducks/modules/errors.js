/* eslint-disable import/prefer-default-export */

import { actionCreators as dialogActions } from './dialogs';

const withErrorDialog = (actionCreator) => (...args) => (dispatch) => {
  const action = actionCreator(...args);
  dispatch(action);
  dispatch(dialogActions.openDialog({ type: 'Error', error: action.error }));
};

export {
  withErrorDialog,
};
