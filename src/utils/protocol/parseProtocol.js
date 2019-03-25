import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import protocolPath from './protocolPath';
import friendlyErrorMessage from '../../utils/friendlyErrorMessage';
import { store } from '../../ducks/store';
import { actionCreators as importActions } from '../../ducks/modules/importProtocol';
import { validateSchema, validateLogic } from './validation';
import { errToString } from './validation/helpers';

const openError = friendlyErrorMessage("There was an error reading that protocol file. It doesn't seem to be a valid JSON object. Check the format of your protocol, and try again.");
const validationError = friendlyErrorMessage('Your protocol file failed validation. See below for the specific problems we found. This is often caused by attempting to open a protocol file authored in an incompatible version of Architect.');

// Basic validation on protocol format;
// any error will halt loading and display a message to the user.
const validateProtocol = (protocol) => {
  const schemaErrors = validateSchema(protocol);
  const logicErrors = validateLogic(protocol);

  if (schemaErrors.length > 0 || logicErrors.length > 0) {
    return Promise.reject(new Error([...schemaErrors, ...logicErrors].map(errToString).join('')));
  }

  return Promise.resolve(protocol);
};

const parseProtocol = (environment) => {
  if (environment !== environments.WEB) {
    store.dispatch(importActions.parseProtocol());
    return protocolUID =>
      readFile(protocolPath(protocolUID, 'protocol.json'))
        .then(json => JSON.parse(json))
        .then(data => validateProtocol(data)).catch(validationError)
        .then((protocol) => {
          const withUID = {
            ...protocol,
            uid: protocolUID,
          };
          return withUID;
        })
        .catch(openError);
  }

  return () => Promise.reject(new Error('parseProtocol() not supported on this platform'));
};

export default inEnvironment(parseProtocol);
