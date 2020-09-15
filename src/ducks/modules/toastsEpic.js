/* eslint-disable import/prefer-default-export */
import React from 'react';
import { combineEpics } from 'redux-observable';
import { filter, map } from 'rxjs/operators';
import { Spinner } from '@codaco/ui';
import { actionCreators as toastActions, toastTypes } from './toasts';
import { actionTypes as exportActionTypes } from './exportProcess';
import { actionTypes as serverActionTypes } from './pairedServer';

/**
 * Data export steps
 * Online/offline status change
 * Server pairing
 * MAKE SURE THESE DO NOT SHOW WITHIN INTERVIEW
 */

const triggerToastActions = [
  exportActionTypes.SESSION_EXPORT_START,
  exportActionTypes.SESSION_EXPORT_FINISH,
  serverActionTypes.SET_SERVER,
];

const toastsEpic = action$ => action$.pipe(
  filter(action => triggerToastActions.includes(action.type)),
  map(action => {
    console.log('action', action);
    switch (action.type) {
      case serverActionTypes.SET_SERVER: {
        return toastActions.addToast({
          type: toastTypes.success,
          title: 'Server set...',
          content: (
            <React.Fragment>
              <p>Successfully paired with Server.</p>
            </React.Fragment>
          ),
        });
      }
      default:
        return toastActions.addToast({
          type: toastTypes.info,
          title: 'Default toast',
          content: (<p>Default toast without proper content.</p>),
          autoDismiss: false,
        });
    }
  }),
);

const epics = combineEpics(
  toastsEpic,
);

export {
  epics,
};
