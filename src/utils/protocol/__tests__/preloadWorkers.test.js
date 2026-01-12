/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';

import preloadWorkers from '../preloadWorkers';
import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import { readFile } from '../../filesystem';
import * as workerAgentHelpers from '../../WorkerAgent';

vi.mock('../../filesystem');

const mockUrl = 'blob:file://script.js';

global.TextDecoder = class TextDecoder {
  decode = vi.fn().mockReturnValue('')
};

describe('preloadWorkers', () => {
  beforeAll(() => {
    getEnvironment.mockReturnValue(environments.ELECTRON);
  });

  describe('when script exists', () => {
    beforeAll(() => {
      readFile.mockReturnValue(Promise.resolve('function myWorker() {}'));
      workerAgentHelpers.urlForWorkerSource = vi.fn().mockReturnValue(mockUrl);
    });

    it('returns a promise', () => {
      expect(preloadWorkers('development', false)).toBeInstanceOf(Promise);
    });

    it('resolves to an array of URLs', async () => {
      const promise = preloadWorkers('development', false);
      await expect(promise).resolves.toBeInstanceOf(Array);
      await expect(promise).resolves.toContainEqual(expect.stringMatching(mockUrl));
    });
  });

  describe('when script doesn’t exist', () => {
    beforeAll(() => {
      readFile.mockRejectedValue(new Error('ENOENT'));
    });

    it('resolves to null URLs', async () => {
      const promise = preloadWorkers('development', false);
      await expect(promise).resolves.toBeInstanceOf(Array);
      await expect(promise).resolves.toContain(null);
    });
  });
});
