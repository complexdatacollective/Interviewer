import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import protocolPath from './protocolPath';
import friendlyErrorMessage from '../../utils/friendlyErrorMessage';
import { validateSchema, validateLogic } from './validation';

const openError = friendlyErrorMessage("We couldn't open that Network Canvas protocol. Check the format, and try again.");

// Basic validation on protocol format;
// any error will halt loading and display a message to the user.
const verifyProtocol = (protocol) => {
  const schemaErrors = validateSchema(protocol);
  const logicErrors = validateLogic(protocol);

  // For now, just log failures
  // if (schemaErrors || logicErrors) {
  //   const noRegistryError = new Error('Invalid protocol');
  //   noRegistryError.friendlyMessage = 'Invalid protocol: missing codebook';
  //   return Promise.reject(protocolErrors);
  // }

  return protocol;
};

const parseProtocol = (environment) => {
  if (environment !== environments.WEB) {
    return protocolName =>
      readFile(protocolPath(protocolName, 'protocol.json'))
        .then(json => JSON.parse(json))
        .then((data) => {
          const protocol = verifyProtocol(data);
          const path = protocolPath(protocolName);
          return { protocol, path };
        })
        .catch(openError);
  }

  return () => Promise.reject(new Error('parseProtocol() not supported on this platform'));
};

export default inEnvironment(parseProtocol);
