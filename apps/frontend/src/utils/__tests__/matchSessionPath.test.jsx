/* eslint-env jest */

import { matchSessionPath } from '../matchSessionPath';

describe('session path helpers', () => {
  const example = '/session/session1/0';

  describe('matchSessionPath', () => {
    it('returns an object with matched params', () => {
      const match = matchSessionPath(example);
      expect(match).toHaveProperty('params');
    });
  });
});
