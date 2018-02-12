import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import factoryProtocolPath from './factoryProtocolPath';
import { friendlyErrorMessage } from '../../ducks/modules/errors';

const loadFactoryProtocol = (environment) => {
  const readProtocolError = friendlyErrorMessage("We couldn't read the protocol. The file may be broken, please try importing it again.");

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

  throw Error(`loadFactoryProtocol not supported in this environment "${environment}"`);
};

export default inEnvironment(loadFactoryProtocol);
