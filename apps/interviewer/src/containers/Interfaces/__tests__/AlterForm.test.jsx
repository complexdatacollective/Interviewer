/* eslint-env jest */
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
  formEnabled: jest.fn(),
  submitForm: jest.fn(),
  updateNode: jest.fn(),
};

describe('AlterForm', () => {
  it('renders AlterForm interface', () => {
    shallow((<AlterForm {...requiredProps} />));
  });
});
