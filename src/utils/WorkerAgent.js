import uuid from 'uuid/v4';

export const NodeLabelWorkerName = 'nodeLabelWorker';
export const supportedWorkers = [NodeLabelWorkerName];

// Create an object URL from worker contents.
// We own the URL and can release it when no longer needed.
export const urlForWorkerSource = (blob) => URL.createObjectURL(blob);

const workers = {};

// Maintain one worker per source URL
const getSharedWorker = (url) => {
  if (!workers[url]) {
    const worker = new Worker(url);
    worker.workMap = {};
    worker.onerror = (err) => {
      // Runtime errors are caught by the worker script wrapper; a syntax error (here) is
      // only issued once, and should indicate that all requests for this URL should fail.
      worker.globalError = err;
      Object.values(worker.workMap).forEach((job) => job.reject(err));
    };
    worker.onmessage = (evt) => {
      const job = worker.workMap[evt.data.messageId];
      if (!job) {
        return;
      }
      if (!job.cancelled) {
        if (evt.data.error) {
          job.reject(evt.data.error);
        } else {
          job.resolve(evt.data.value);
        }
      }
      delete worker.workMap[evt.data.messageId];
    };
    workers[url] = worker;
    URL.revokeObjectURL(url);
  }
  return workers[url];
};

/**
 * @class WorkerAgent
 * @description A broker between a single web Worker and multiple clients.
 */
class WorkerAgent {
  constructor(url) {
    try {
      this.worker = getSharedWorker(url);
    } catch (e) {
      // no-op. Check isReady() or catch postMessage().
    }
  }

  /**
   * @property {Boolean} isReady True if the worker was successfully initialized.
   */
  get isReady() {
    return Boolean(this.worker);
  }

  /**
   * Cancel the expected receipt of a worker response.
   * @param {string} cancellationId The ID of the message to cancel
   */
  cancelMessage(messageId) {
    const job = this.worker.workMap[messageId];
    if (job) {
      job.cancelled = true;
    }
  }

  /**
   * @typedef {PromisedMessage} A promise, decorated with cancellation ID.
   * @property {string} cancellationId - can be used as input to @link{#cancelMessage}
   */

  /**
   * Post a message to a web Worker
   * @async
   * @param  {any} msg a serializable message to post to a worker
   * @return {PromisedMessage} resolves to the message returned from the worker.
   */
  sendMessageAsync(msg) {
    if (!this.worker) {
      return Promise.reject(new Error('Worker unavailable'));
    }
    if (this.worker.globalError) {
      return Promise.reject(new Error(`Worker has global error: ${this.worker.globalError.message}`));
    }
    const messageId = uuid();
    const taggedMsg = { ...msg, messageId };
    const promise = new Promise((resolve, reject) => {
      this.worker.workMap[messageId] = { msg: taggedMsg, resolve, reject };
    });
    promise.cancellationId = taggedMsg.messageId;
    this.worker.postMessage(taggedMsg);
    return promise;
  }
}

export default WorkerAgent;
