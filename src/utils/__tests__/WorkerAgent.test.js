/* eslint-env jest */

import WorkerAgent, { urlForWorkerSource } from '../WorkerAgent';

const mockUrl = 'blob:file://script.js';

global.URL = class URL {
  static createObjectURL = jest.fn().mockReturnValue(mockUrl)
  static revokeObjectURL = jest.fn()
};

global.Worker = class Worker {
  onmessage = jest.fn()
  postMessage = jest.fn().mockResolvedValue({})
};

describe('WorkerAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new WorkerAgent(mockUrl);
  });

  it('creates a web worker', () => {
    expect(agent.worker).toBeInstanceOf(Worker);
  });

  it('is ready after worker created', () => {
    expect(agent.isReady).toBe(true);
  });

  it('returns a promise for a message', () => {
    expect(agent.sendMessageAsync()).toBeInstanceOf(Promise);
  });

  it('decorates the promise with a cancellation ID', () => {
    expect(agent.sendMessageAsync()).toHaveProperty('cancellationId');
  });

  describe('worker', () => {
    const mockMessageId = 'abc';
    const mockError = new Error('mockError');
    let mockJob;

    beforeEach(() => {
      mockJob = {
        msg: { mockMessageId },
        resolve: jest.fn().mockResolvedValue({}),
        reject: jest.fn().mockImplementation(() => mockError),
      };
      agent.worker.workMap[mockMessageId] = mockJob;
    });

    it('resolves the promised message', () => {
      const msgData = { messageId: mockMessageId, value: 'foo' };
      agent.worker.onmessage({ data: msgData });
      expect(mockJob.resolve).toHaveBeenCalledWith(msgData.value);
    });

    it('rejects unknown messages', () => {
      const msgData = { messageId: mockMessageId, error: mockError };
      agent.worker.onmessage({ data: msgData });
      expect(mockJob.reject).toHaveBeenCalledWith(mockError);
    });

    it('allows a job to be cancelled', () => {
      expect(mockJob.cancelled).not.toBe(true);
      agent.cancelMessage(mockMessageId);
      expect(mockJob.cancelled).toBe(true);
    });
  });
});

describe('urlForWorkerSource', () => {
  it('creates a url string from a blob', () => {
    expect(urlForWorkerSource(new Blob())).toEqual(mockUrl);
  });
});
