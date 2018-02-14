/* eslint-env jest */

import { makeGetSociogramOptions } from '../sociogram';

const mockProps = {
  prompt: {
    layout: {},
  },
};

const mockState = {
};

describe('sociogram selector', () => {
  describe('makeGetSociogramOptions()', () => {
    let getSociogramOptions;

    beforeEach(() => {
      getSociogramOptions = makeGetSociogramOptions();
    });

    it('when highlight option is missing, allowHighlighting is false', () => {
      const subject = getSociogramOptions(mockState, mockProps);
      expect(subject.allowHighlighting).toEqual(false);
    });
  });
});
