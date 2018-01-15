import { readFile } from '../filesystem';
import { protocolPath } from './';
import environments from '../environments';
import inEnvironment from '../Environment';
import demoProtocol from '../../other/demo.canvas/protocol.json';

const getProtocol = (environment) => {
  if (environment === environments.ELECTRON) {
    console.log('thinks its electron');
    return protocolName =>
      readFile(protocolPath(protocolName, 'protocol.json'), 'utf8')
        .then(data => JSON.parse(data));
  }

  // NOTE: loads demo protocol from local import, ignoring protocol name
  return () => {
    console.log('Loading demo protocol from local import, and ignoring protocol name');
    return Promise.resolve(demoProtocol);
  };
};

export { getProtocol };

export default inEnvironment(getProtocol);
