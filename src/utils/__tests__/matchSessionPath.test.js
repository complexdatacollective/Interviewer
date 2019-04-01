/* eslint-env jest */

import { matchSessionPath, protocolIdFromSessionPath } from '../matchSessionPath';

describe('session path helpers', () => {
  const protocolId = 'protocol2';
  const example = '/session/session1/0';

  describe('matchSessionPath', () => {
    it('returns an object with matched params', () => {
      const match = matchSessionPath(example);
      expect(match).toHaveProperty('params');
    });
  });

  describe('protocolIdFromSessionPath', () => {
    it('matches protocol ID (path)', () => {
      expect(protocolIdFromSessionPath(example)).toEqual(protocolId);
    });
  });
});
