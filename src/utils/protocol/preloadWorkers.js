/**
 * Preload workers utility with secure API support.
 */

import { pathSync } from '../electronAPI';
import { isCapacitor } from '../Environment';
import { readDirectory, readFile } from '../filesystem';
import { supportedWorkers, urlForWorkerSource } from '../WorkerAgent';
import protocolPath from './protocolPath';

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
          .then((val) => postMessage({ messageId, value: val }))
          .catch(onError);
      } else {
        postMessage({ messageId, value: result });
      }
    }})(${funcName});
    `;
};

/**
 * preloadWorkers
 * @description Read custom worker scripts from the protocol package, if any.
 * By preloading any existing, we can bootstrap before protocol.json is parsed.
 */
const preloadWorkers = async (protocolUID) => {
  const basePath = await protocolPath(protocolUID);

  // On Capacitor, reading a non-existent worker file logs a native error, so
  // list the protocol directory up front and only read workers that exist.
  // Other platforms fall through to readFile's own (quiet) miss handling.
  let presentFiles = null;
  if (isCapacitor()) {
    presentFiles = await readDirectory(basePath).catch(() => []);
  }

  return Promise.all(
    supportedWorkers.map((workerName) => {
      const workerFileName = `${workerName}.js`;

      if (presentFiles && !presentFiles.includes(workerFileName)) {
        return Promise.resolve(null);
      }

      const workerFile = isCapacitor()
        ? `${basePath}${workerFileName}`
        : pathSync.join(basePath, workerFileName);

      return readFile(workerFile)
        .then((buf) => new TextDecoder().decode(buf))
        .then((str) => compileWorker(str, workerName))
        .then((source) => new Blob([source], { type: 'text/plain' }))
        .then((blob) => urlForWorkerSource(blob))
        .catch(() => null);
    }),
  );
};

export default preloadWorkers;
