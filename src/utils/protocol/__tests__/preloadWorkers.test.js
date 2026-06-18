import { vi } from 'vitest';

import { getEnvironment } from '../../Environment';
import environments from '../../environments';
import { readFile } from '../../filesystem';
import { urlForWorkerSource } from '../../WorkerAgent';
import preloadWorkers from '../preloadWorkers';

vi.mock('../../Environment');
vi.mock('../../filesystem');
vi.mock('../../WorkerAgent', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    urlForWorkerSource: vi.fn(),
  };
});

const mockUrl = 'blob:file://script.js';

global.TextDecoder = class TextDecoder {
  decode = vi.fn().mockReturnValue('');
};

describe('preloadWorkers', () => {
  beforeAll(() => {
    getEnvironment.mockReturnValue(environments.ELECTRON);
  });

  describe('when script exists', () => {
    beforeAll(() => {
      readFile.mockReturnValue(Promise.resolve('function myWorker() {}'));
      urlForWorkerSource.mockReturnValue(mockUrl);
    });

    it('returns a promise', () => {
      expect(preloadWorkers('development', false)).toBeInstanceOf(Promise);
    });

    it('resolves to an array of URLs', async () => {
      const promise = preloadWorkers('development', false);
      await expect(promise).resolves.toBeInstanceOf(Array);
      await expect(promise).resolves.toContainEqual(
        expect.stringMatching(mockUrl),
      );
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
