/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import React from 'react';
import { shallow } from 'enzyme';
import { AlterForm } from '../AlterForm';

const requiredProps = {
  form: {
    title: 'alpha',
    entity: 'node',
    type: 'person',
  },
  stageNodes: [{ name: 'One' }, { name: 'Two' }],
  stage: { introductionPanel: { title: 'intro', text: 'content' } },
  formEnabled: vi.fn(),
  submitForm: vi.fn(),
  updateNode: vi.fn(),
};

describe('AlterForm', () => {
  it('renders AlterForm interface', () => {
    shallow((<AlterForm {...requiredProps} />));
  });
});
