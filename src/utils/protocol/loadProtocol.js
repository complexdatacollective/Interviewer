import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import protocolPath from './protocolPath';
import demoProtocol from '../../other/demo.canvas/protocol.json';

const loadProtocol = (environment) => {
  if (environment !== environments.WEB) {
    return protocolName =>
      readFile(protocolPath(protocolName, 'protocol.json'))
        .then(data => JSON.parse(data));
  }

  // NOTE: loads demo protocol from local import, ignoring protocol name
  return () => {
    console.log('Loading demo protocol from local import, and ignoring protocol name'); // eslint-disable-line
    return Promise.resolve(demoProtocol);
  };
};

export default inEnvironment(loadProtocol);
