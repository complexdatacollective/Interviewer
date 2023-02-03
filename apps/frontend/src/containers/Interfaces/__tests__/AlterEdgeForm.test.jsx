/* eslint-env jest */
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
  formEnabled: jest.fn(),
  submitForm: jest.fn(),
  updateEdge: jest.fn(),
};

describe('AlterEdgeForm', () => {
  it('renders AlterEdgeForm interface', () => {
    shallow((<AlterEdgeForm {...requiredProps} />));
  });
});
