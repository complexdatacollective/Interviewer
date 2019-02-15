/* eslint-env jest */

import { makeRehydrateForm } from '../forms';

describe('forms selector', () => {
  describe('makeRehydrateForm', () => {
    const state = {
      protocol: {
        forms: { person: {} },
      },
    };
    let rehydrateForm;

    beforeEach(() => {
      rehydrateForm = makeRehydrateForm();
    });

    it('defaults to null', () => {
      const props = { stage: {} };
      expect(rehydrateForm(state, props)).toBe(null);
    });

    it('returns null when defined as null (from Architect)', () => {
      const props = { stage: { person: null } };
      expect(rehydrateForm(state, props)).toBe(null);
    });

    it('returns form if defined', () => {
      const props = { stage: { form: 'person' } };
      expect(rehydrateForm(state, props)).toEqual(state.activeProtocol.forms.person);
    });
  });
});
