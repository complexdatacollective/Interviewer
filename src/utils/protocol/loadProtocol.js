/* eslint-disable */

import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import protocolPath from './protocolPath';
// import demoProtocol from '../../other/demo.canvas/protocol.json';

const loadProtocol = (environment) => {
  if (environment !== environments.WEB) {
    return protocolName =>
      readFile(protocolPath(protocolName, 'protocol.json'))
        .then(data => JSON.parse(data));
  }

  if (environment === environments.WEB) {
    return protocolName => {

      fetch(`/protocols/${protocolName}/protocol.json`).then(response => console.log(response.json()));

      return fetch(`/protocols/${protocolName}/protocol.json`)
        .then(response => response.json());
    }
  }

  throw Error(`loadProtocol not supported in this environment "${environment}"`);
};

export default inEnvironment(loadProtocol);
