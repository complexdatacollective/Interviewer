/* eslint-disable import/prefer-default-export */
import React from 'react';
import { combineEpics } from 'redux-observable';
import { filter, map } from 'rxjs/operators';
import { actionCreators as toastActions, toastTypes } from './toasts';
import { actionTypes as serverActionTypes } from './pairedServer';

/**
 * Online/offline status change
 * Server pairing
 * MAKE SURE THESE DO NOT SHOW WITHIN INTERVIEW
 */

const triggerToastActions = [
  serverActionTypes.SET_SERVER,
];

const toastsEpic = action$ => action$.pipe(
  filter(action => triggerToastActions.includes(action.type)),
  map((action) => {
    switch (action.type) {
      case serverActionTypes.SET_SERVER: {
        return toastActions.addToast({
          type: toastTypes.success,
          title: 'Pairing complete!',
          content: (
            <React.Fragment>
              <p>You have successfully paired with Server.</p>
            </React.Fragment>
          ),
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
