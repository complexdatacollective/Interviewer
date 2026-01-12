/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker, max-classes-per-file */

import WorkerAgent, { urlForWorkerSource } from '../WorkerAgent';

const mockUrl = 'blob:file://script.js';

global.URL = class URL {
  static createObjectURL = vi.fn().mockReturnValue(mockUrl)

  static revokeObjectURL = vi.fn()
};

global.Worker = class Worker {
  onmessage = vi.fn()

  postMessage = vi.fn().mockResolvedValue({})
};

describe('WorkerAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new WorkerAgent(mockUrl);
  });

  afterEach(() => {
    if (agent.worker) {
      agent.worker.workMap = {}; // Clear out shared jobs
    }
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

  it('rejects when unavailable', () => {
    agent.worker = null;
    expect(agent.sendMessageAsync()).rejects.toMatchObject({ message: 'Worker unavailable' });
  });

  it('rejects when a shared worker has errored', () => {
    agent.worker.globalError = new Error('mock syntax error');
    expect(agent.sendMessageAsync()).rejects.toMatchObject({
      message: expect.stringMatching(agent.worker.globalError.message),
    });
  });

  describe('worker', () => {
    const mockMessageId = 'abc';
    const mockError = new Error('mockError');
    let mockJob;

    beforeEach(() => {
      mockJob = {
        msg: { mockMessageId },
        resolve: vi.fn().mockResolvedValue({}),
        reject: vi.fn(),
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

    it('rejects all when worker has a syntax error', () => {
      const mockJob2 = { ...mockJob };
      const syntaxError = new SyntaxError();
      agent.worker.workMap.mockJobId2 = mockJob2;
      agent.worker.onerror(syntaxError);
      expect(mockJob.reject).toHaveBeenCalledWith(syntaxError);
      expect(mockJob2.reject).toHaveBeenCalledWith(syntaxError);
    });
  });
});

describe('urlForWorkerSource', () => {
  it('creates a url string from a blob', () => {
    expect(urlForWorkerSource(new Blob())).toEqual(mockUrl);
  });
});
