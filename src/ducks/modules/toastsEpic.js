/* eslint-disable import/prefer-default-export */
import React from 'react';
import { combineEpics } from 'redux-observable';
import { filter, map } from 'rxjs/operators';
import { actionCreators as toastActions } from './toasts';
import { actionTypes as serverActionTypes } from './pairedServer';

const triggerToastActions = [
  serverActionTypes.SET_SERVER,
];

const toastsEpic = action$ => action$.pipe(
  filter(action => triggerToastActions.includes(action.type)),
  map((action) => {
    switch (action.type) {
      case serverActionTypes.SET_SERVER: {
        return toastActions.addToast({
          type: 'success',
          title: 'Pairing complete!',
          content:
          (<p>
            You have successfully paired with Server. You may now fetch protocols
            and upload data.
          </p>),
        });
      }
      default:
        return null;
    }
  }),
);

const epics = combineEpics(
  toastsEpic,
);

export {
  epics,
};
