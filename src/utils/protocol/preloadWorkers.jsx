import { readFile } from '../filesystem';
import { isCordova } from '../Environment';
import protocolPath from './protocolPath';
import { urlForWorkerSource, supportedWorkers } from '../WorkerAgent';

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
    onmessage = ((userFunc) => ${({ data }) => {
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

/**
 * preloadWorkers
 * @description Read custom worker scripts from the protocol package, if any.
 * By preloading any existing, we can bootstrap before protocol.json is parsed.
 */
const preloadWorkers = (protocolUID) => {
  return Promise.all(supportedWorkers.map((workerName) => {
    console.warn('preloadWorkers not implemented');
    return Promise.resolve();
    // let workerFile;

    // if (isCordova()) {
    //   workerFile = `${protocolPath(protocolUID)}${workerName}.js`;
    // } else {
    //   workerFile = path.join(protocolPath(protocolUID), `${workerName}.js`);
    // }

    // const promise = readFile(workerFile);

    // return promise
    //   /**
    //    * Load from blob so that script inherits CSP
    //    */
    //   .then(buf => new TextDecoder().decode(buf))
    //   .then(str => compileWorker(str, workerName))
    //   .then(source => new Blob([source], { type: 'text/plain' }))
    //   .then(blob => urlForWorkerSource(blob))
    //   .catch(() => null);
  }));
};

export default preloadWorkers;
