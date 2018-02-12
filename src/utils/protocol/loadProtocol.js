import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import protocolPath from './protocolPath';
import { friendlyErrorMessage } from '../../ducks/modules/errors';

const openError = friendlyErrorMessage("We couldn't open that Network Canvas protocol. Check the format, and try again.");

const loadProtocol = (environment) => {
  if (environment !== environments.WEB) {
    return protocolName =>
      readFile(protocolPath(protocolName, 'protocol.json'))
        .then(data => JSON.parse(data))
        .catch(openError);
  }

  throw Error(`loadProtocol not supported in this environment "${environment}"`);
};

export default inEnvironment(loadProtocol);
