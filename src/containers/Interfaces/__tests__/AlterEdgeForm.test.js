/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import React from 'react';
import { shallow } from 'enzyme';
import { AlterEdgeForm } from '../AlterEdgeForm';

const requiredProps = {
  form: {
    title: 'alpha',
    entity: 'edge',
    type: 'friend',
  },
  stageEdges: [{ name: 'One' }, { name: 'Two' }],
  stage: { introductionPanel: { title: 'intro', text: 'content' } },
  formEnabled: vi.fn(),
  submitForm: vi.fn(),
  updateEdge: vi.fn(),
};

describe('AlterEdgeForm', () => {
  it('renders AlterEdgeForm interface', () => {
    shallow((<AlterEdgeForm {...requiredProps} />));
  });
});
