/* eslint-env jest */

import environments from '../environments';
import { getEnvironment } from '../Environment';
import { getNestedPaths } from '../filesystem';

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
  });
});
