/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi, describe, it, expect, beforeAll } from 'vitest';
import environments from '../environments';
import { getEnvironment } from '../Environment';
import { writeStream } from '../filesystem';

vi.mock('../Environment');

describe('filesystem', () => {
  describe('Cordova', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.CORDOVA);
    });

    describe('with mocked fs', () => {
      const mockFileWriter = ({
        readyState: 0,
        abort: vi.fn(),
        write: vi.fn(),
      });

      const mockFileEntry = ({
        createWriter: vi.fn().mockImplementation((resolve) => resolve(mockFileWriter)),
      });

      const mockDirectoryEntry = ({
        getFile: vi.fn().mockImplementation((filename, opts, resolve) => resolve(mockFileEntry)),
      });

      const mockZipStream = {
        on: vi.fn().mockImplementation((evt, cb) => {
          if (evt === 'end') { cb(); }
          return mockZipStream;
        }),
        resume: vi.fn(),
      };

      beforeAll(() => {
        global.resolveLocalFileSystemURL = vi.fn().mockImplementation((path, resolve) => {
          resolve(mockDirectoryEntry);
        });
      });

      it('implements stream writing', async () => {
        await writeStream('cdvfile://localhost/foo.mp4', mockZipStream);
        expect(mockZipStream.on).toHaveBeenCalledWith('data', expect.any(Function));
      });
    });
  });
});
