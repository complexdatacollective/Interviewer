import { errToString } from './helpers.js';

/* eslint-disable no-console */
const logErrors = (errors, title) => {
  if (errors && errors.length) {
    console.group(title || 'Protocol errors');
    errors.forEach(err => console.warn(errToString(err)));
    console.groupEnd();
  }
};
/* eslint-enable no-console */

export default logErrors;
