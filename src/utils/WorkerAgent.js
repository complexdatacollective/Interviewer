import uuidv4 from './uuid';

const workers = {};

const getSharedWorker = (url) => {
  if (!workers[url]) {
    const worker = new Worker(url);
    worker.workMap = {};
    worker.onerror = () => {};
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
  }
  return workers[url];
};

/**
 * @class WorkerAgent
 * @description A broker between a single web Worker and multiple clients.
 */
class WorkerAgent {
  constructor(url) {
    this.workerUrl = url;
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
      return Promise.reject(new Error(`Worker unavailable at ${this.workerUrl}`));
    }
    const messageId = uuidv4();
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
