/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

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
        getNestedPaths('file:///data/user/0/org.codaco.NetworkCanvasInterviewer6/protocols/15f6f8aa-1442-4ade-8475-3dd66828fac2/assets/'),
      ).toEqual([
        'file:///data/user/0/org.codaco.NetworkCanvasInterviewer6/protocols/',
        'file:///data/user/0/org.codaco.NetworkCanvasInterviewer6/protocols/15f6f8aa-1442-4ade-8475-3dd66828fac2/',
        'file:///data/user/0/org.codaco.NetworkCanvasInterviewer6/protocols/15f6f8aa-1442-4ade-8475-3dd66828fac2/assets/',
      ]);

      // expect(
      //   getNestedPaths('file:///data/user/0/com.some.app/data/nested/paths/here/'),
      // ).toEqual([
      //   'file:///data/user/0/com.some.app/data/',
      //   'file:///data/user/0/com.some.app/data/nested/',
      //   'file:///data/user/0/com.some.app/data/nested/paths/',
      //   'file:///data/user/0/com.some.app/data/nested/paths/here/',
      // ]);
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
