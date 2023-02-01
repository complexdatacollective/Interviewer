/* eslint-env jest */


import environments from '../environments';
// eslint-disable-next-line import/named
import { getEnvironment } from '../Environment';
import { getNestedPaths, writeStream } from '../filesystem';

describe('filesystem', () => {
  describe('Cordova', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.CORDOVA);
    });

    it('getNestedPaths', () => {
      expect(
        getNestedPaths('cdvfile://localhost/persistent/protocols/development.netcanvas/assets'),
      ).toEqual([
        'cdvfile://localhost/persistent/protocols/',
        'cdvfile://localhost/persistent/protocols/development.netcanvas/',
        'cdvfile://localhost/persistent/protocols/development.netcanvas/assets/',
      ]);
    });

    describe('with mocked fs', () => {
      const mockFileWriter = ({
        readyState: 0,
        abort: jest.fn(),
        write: jest.fn(),
      });

      const mockFileEntry = ({
        createWriter: jest.fn().mockImplementation((resolve) => resolve(mockFileWriter)),
      });

      const mockDirectoryEntry = ({
        getFile: jest.fn().mockImplementation((filename, opts, resolve) => resolve(mockFileEntry)),
      });

      const mockZipStream = {
        on: jest.fn().mockImplementation((evt, cb) => {
          if (evt === 'end') { cb(); }
          return mockZipStream;
        }),
        resume: jest.fn(),
      };

      beforeAll(() => {
        global.resolveLocalFileSystemURL = jest.fn().mockImplementation((path, resolve) => {
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
