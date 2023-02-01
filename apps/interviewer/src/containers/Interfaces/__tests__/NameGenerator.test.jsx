/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { UnconnectedNameGenerator as NameGenerator } from '../NameGenerator';

const requiredProps = {
  addNode: jest.fn(),
  getLabel: jest.fn(),
  newNodeAttributes: {},
  nodesForPrompt: [],
  openModal: jest.fn(),
  prompt: {},
  stage: {},
  promptBackward: jest.fn(),
  promptForward: jest.fn(),
  updateNode: jest.fn(),
  registerBeforeNext: jest.fn(),
};

describe('NameGenerator', () => {
  it('does not require a form prop', () => {
    const elem = shallow(<NameGenerator {...requiredProps} />);
    expect(elem.find('Connect(NodeForm)')).toHaveLength(0);
  });

  it('renders a node form if provided in props', () => {
    const props = {
      stage: { form: {} },
    };
    const elem = shallow(<NameGenerator {...requiredProps} {...props} />);
    elem.find('.name-generator-interface__add-node').simulate('click');
    expect(elem.find('Connect(NodeForm)').length).toBeGreaterThan(0);
  });
});
