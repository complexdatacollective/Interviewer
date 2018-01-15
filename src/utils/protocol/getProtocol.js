import { readFile } from '../filesystem';
import { protocolPath } from './';
import environments from '../environments';
import inEnvironment from '../Environment';

const getProtocol = (environment) => {
  switch (environment) {
    case environments.ELECTRON: {
      return protocolName =>
        readFile(protocolPath(protocolName, 'protocol.json'), 'utf8')
          .then(data => JSON.parse(data));
    }
    default:
      return Promise.reject('Local protocol file not yet supported in Cordova');
  }
};

export { getProtocol };

export default inEnvironment(getProtocol);
