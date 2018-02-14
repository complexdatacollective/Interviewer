/* eslint-env jest */

import { makeGetSociogramOptions } from '../sociogram';

const mockPrompt = {
  layout: {},
};

const mockProps = {
  prompt: mockPrompt,
};

const mockState = {
};

describe('sociogram selector', () => {
  describe('makeGetSociogramOptions()', () => {
    let getSociogramOptions;

    beforeEach(() => {
      getSociogramOptions = makeGetSociogramOptions();
    });

    describe('props.prompt.highlight', () => {
      it('when highlight option is missing, allowHighlighting is false', () => {
        const subject = getSociogramOptions(mockState, mockProps);
        expect(subject.allowHighlighting).toEqual(false);
      });
      it('when highlight option exists, allowHighlighting is true', () => {
        const prompt = {
          ...mockPrompt,
          highlight: {},
        };
        const subject = getSociogramOptions(mockState, { prompt });
        expect(subject.allowHighlighting).toEqual(true);
      });
      it('when allowHighlighting option exists, allowHighlighting should match', () => {
        let prompt = {
          ...mockPrompt,
          highlight: { allowHighlighting: false },
        };
        let subject = getSociogramOptions(mockState, { prompt });
        expect(subject.allowHighlighting).toEqual(false);

        prompt = {
          ...mockPrompt,
          highlight: { allowHighlighting: true },
        };
        subject = getSociogramOptions(mockState, { prompt });
        expect(subject.allowHighlighting).toEqual(true);
      });
    });
  });
});
