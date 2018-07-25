import { readFile } from '../filesystem';
import environments from '../environments';
import inEnvironment from '../Environment';
import factoryProtocolPath from './factoryProtocolPath';
import protocolPath from './protocolPath';

const supportedWorkers = ['nodeLabelWorker'];

/**
 * Builds source code for a Web Worker based on the protocol's
 * mapping function.
 *
 * Postfixed code takes care of some housekeeping:
 * - Register the mapping function with the worker (onmessage)
 * - Deal with message IDs (for multiplexing to a single worker)
 * - Catch errors in user code so that message IDs are preserved
 *
 * User code must:
 * - contain a named function, named according to the worker
 * - return the expected serializable value, or a promise that resolves to it
 *
 * @private
 */
const compileWorker = (src, funcName) => {
  if (supportedWorkers.indexOf(funcName) < 0) {
    throw new Error('Unsupported worker function name', funcName);
  }
  /* eslint-disable indent, no-undef, no-console */
  return `
    ${src}
    ;
    onmessage = ((userFunc) => ${
      ({ data }) => {
        const messageId = data.messageId;
        const onError = (scriptErr) => {
          postMessage({
            messageId,
            error: {
              name: scriptErr.name,
              message: scriptErr.message,
            },
          });
        };

        let result;
        try {
          result = userFunc(data);
        } catch (err) {
          onError(err);
        }
        if (result instanceof Promise) {
          result
            .then(val => postMessage({ messageId, value: val }))
            .catch(onError);
        } else {
          postMessage({ messageId, value: result });
        }
      }
    })(${funcName});
    `;
  /* eslint-enable */
};

const loadWorker = (environment) => {
  if (environment !== environments.WEB) {
    return (protocolName, workerName, isFactory) =>
      readFile((isFactory ? factoryProtocolPath : protocolPath)(protocolName, `${workerName}.js`))
        /**
         * Load from blob so that script inherits CSP
         */
        .then(buf => new TextDecoder().decode(buf))
        .then(str => compileWorker(str, workerName))
        .then(source => new Blob([source], { type: 'text/plain' }))
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
