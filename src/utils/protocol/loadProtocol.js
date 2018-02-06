/* eslint-disable */

import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import protocolPath from './protocolPath';

const loadProtocol = (environment) => {
  if (environment !== environments.WEB) {
    return protocolName => {
      console.log(protocolPath(protocolName, 'protocol.json'));
      readFile(protocolPath(protocolName, 'protocol.json')).then(console.log);
      return readFile(protocolPath(protocolName, 'protocol.json'))
        .then(data => JSON.parse(data));
    }
  }

  throw Error(`loadProtocol not supported in this environment "${environment}"`);
};

export default inEnvironment(loadProtocol);
