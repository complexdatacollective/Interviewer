/* eslint-env jest */

import { makeGetSociogramOptions } from '../sociogram';

const mockPrompt = {
  layout: {},
  subject: {
    type: 'foo',
  },
};

const mockProps = {
  prompt: mockPrompt,
};

const mockState = {
  protocol: {
    variableRegistry: { node: { foo: {} } },
  },
};

describe('sociogram selector', () => {
  describe('makeGetSociogramOptions()', () => {
    let getSociogramOptions;

    beforeEach(() => {
      getSociogramOptions = makeGetSociogramOptions();
    });

    describe('allowHighlighting', () => {
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
      it('when props.prompt.edges.create option exists, allowHighlighting should be false', () => {
        const prompt = {
          ...mockPrompt,
          edges: { create: 'foo' },
          highlight: { allowHighlighting: true },
        };
        const subject = getSociogramOptions(mockState, { prompt });
        expect(subject.allowHighlighting).toEqual(false);
      });
    });
  });
});
