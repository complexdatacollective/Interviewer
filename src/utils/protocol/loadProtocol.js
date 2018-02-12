import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import protocolPath from './protocolPath';
import { friendlyErrorMessage } from '../../ducks/modules/errors';

const loadProtocol = (environment) => {
  if (environment !== environments.WEB) {
    return protocolName =>
      readFile(protocolPath(protocolName, 'protocol.json'))
        .then(data => JSON.parse(data))
        .catch(friendlyErrorMessage("We couldn't read the protocol. The file may be broken, please try importing it again."));
  }

  throw Error(`loadProtocol not supported in this environment "${environment}"`);
};

export default inEnvironment(loadProtocol);
