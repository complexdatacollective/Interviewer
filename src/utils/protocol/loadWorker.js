import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import factoryProtocolPath from './factoryProtocolPath';
import protocolPath from './protocolPath';

const loadWorker = (environment) => {
  if (environment !== environments.WEB) {
    return (protocolName, workerName, isFactory) =>
      readFile((isFactory ? factoryProtocolPath : protocolPath)(protocolName, `${workerName}.js`))
        // .then(buf => new Blob(buf, { type: 'text/plain' }))
        /**
         * Load from blob so that script inherits CSP
         */
        .then(buf => new TextDecoder().decode(buf))
        .then(str => new Blob([str], { type: 'text/plain' }))
        // FIXME: need to release (revokeObjectURL) (make each consumer responsible
        //    for releasing after worker created, instead of caching?)
        .then(blob => URL.createObjectURL(blob))
        // TODO: could try to use a shared worker... (but see above about URL)
        // .then(url => new Worker(url))
        .catch(err => console.warn(err)); // eslint-disable-line no-console
  }

  return () => Promise.reject(new Error('loadProtocol() not supported on this platform'));
};

export default inEnvironment(loadWorker);
