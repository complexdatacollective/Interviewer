import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import factoryProtocolPath from './factoryProtocolPath';
import { friendlyErrorMessage } from '../../ducks/modules/errors';

const readProtocolError = friendlyErrorMessage("We couldn't open that Network Canvas protocol. Check the format, and try again.");

const loadFactoryProtocol = (environment) => {
  if (environment !== environments.WEB) {
    return protocolName =>
      readFile(factoryProtocolPath(protocolName, 'protocol.json'))
        .then(data => JSON.parse(data))
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
