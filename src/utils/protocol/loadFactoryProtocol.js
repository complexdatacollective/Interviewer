import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import factoryProtocolPath from './factoryProtocolPath';
import friendlyErrorMessage from '../../utils/friendlyErrorMessage';
import { validateSchema, validateLogic, logErrors } from './validation';

const readProtocolError = friendlyErrorMessage("We couldn't open that Network Canvas protocol. Check the format, and try again.");

// TODO: remove; no need to do this for factory (?); just for dev
const verifyProtocol = (protocol) => {
  const schemaErrors = validateSchema(protocol);
  const logicErrors = validateLogic(protocol);

  logErrors(schemaErrors, 'Protocol schema errors');
  logErrors(logicErrors, 'Protocol logic errors');

  return protocol;
};

const loadFactoryProtocol = (environment) => {
  if (environment !== environments.WEB) {
    return protocolName =>
      readFile(factoryProtocolPath(protocolName, 'protocol.json'))
        .then(data => JSON.parse(data))
        .then(verifyProtocol)
        .catch(readProtocolError);
  }

  if (environment === environments.WEB) {
    return protocolName =>
      fetch(`/protocols/${protocolName}/protocol.json`)
        .then(response => response.json())
        .catch(readProtocolError);
  }

  return () => Promise.reject(new Error('loadFactoryProtocol not supported on this platform'));
};

export default inEnvironment(loadFactoryProtocol);
