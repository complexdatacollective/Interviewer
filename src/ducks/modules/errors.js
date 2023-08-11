/* eslint-disable import/prefer-default-export */
import { actionCreators as dialogActions } from './dialogs';

const withErrorDialog = (actionCreator) => (...args) => (dispatch) => {
  dispatch({ type: 'PLAY_SOUND', sound: 'error' });
  const action = actionCreator(...args);
  dispatch(action);
  dispatch(dialogActions.openDialog({ type: 'Error', error: action.error }));
};

export {
  withErrorDialog,
};
