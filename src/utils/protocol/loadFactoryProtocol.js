import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import factoryProtocolPath from './factoryProtocolPath';

const loadFactoryProtocol = (environment) => {
  if (environment !== environments.WEB) {
    return protocolName =>
      readFile(factoryProtocolPath(protocolName, 'protocol.json'))
        .then(data => JSON.parse(data));
  }

  if (environment === environments.WEB) {
    return protocolName =>
      fetch(`/protocols/${protocolName}/protocol.json`)
        .then(response => response.json());
  }

  throw Error(`loadFactoryProtocol not supported in this environment "${environment}"`);
};

export default inEnvironment(loadFactoryProtocol);
