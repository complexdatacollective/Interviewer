/* eslint-env jest */

import reducer, { actionCreators } from '../servers';

const initialState = {
  services: [],
};

describe('server reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual(initialState);
  });

  describe('serviceAnnounced()', () => {
    it('should add service to services', () => {
      const subject = reducer(initialState, actionCreators.serviceAnnounced({ interfaceIndex: 9, name: 'foo' }));

      expect(subject).toEqual({
        services: [
          { name: 'foo', interfaceIndex: 9, status: 'ANNOUNCED' },
        ],
      });
    });
  });

  describe('serviceResolved()', () => {
    it('should update service in services', () => {
      const subject = reducer({
        services: [
          { name: 'foo', interfaceIndex: 9, status: 'ANNOUNCED' },
        ],
      }, actionCreators.serviceResolved({ interfaceIndex: 9, name: 'foo' }));

      expect(subject).toEqual({
        services: [
          { name: 'foo', interfaceIndex: 9, status: 'RESOLVED' },
        ],
      });
    });
  });

  describe('serviceRemoved()', () => {
    it('should remove service in services', () => {
      const subject = reducer({
        services: [
          { name: 'foo', interfaceIndex: 9, status: 'RESOLVED' },
        ],
      }, actionCreators.serviceRemoved({ interfaceIndex: 9 }));

      expect(subject).toEqual({
        services: [],
      });
    });
  });
});
