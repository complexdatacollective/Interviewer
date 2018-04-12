/* eslint-env jest */

import { makeGetPanelConfiguration } from '../name-generator';

const mockProps = {
  stage: {
    panels: [
      { foo: 'bar' },
    ],
  },
};

const mockState = {
};

describe('name generator selector', () => {
  describe('makeGetPanelConfiguration()', () => {
    const getPanelConfiguration = makeGetPanelConfiguration();

    it('returns an array of panel configurations', () => {
      const subject = getPanelConfiguration(mockState, mockProps);
      expect(subject[0]).toMatchObject(
        {
          dataSource: 'existing',
          foo: 'bar',
          title: '',
        },
      );
      expect(subject[0]).toHaveProperty('filter');
    });

    it('always returns an array', () => {
      const subject = getPanelConfiguration(
        mockState,
        {
          stage: {
          },
        },
      );

      expect(subject).toEqual([]);
    });
  });
});
