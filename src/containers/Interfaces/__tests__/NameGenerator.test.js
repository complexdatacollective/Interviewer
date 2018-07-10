/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { UnconnectedNameGenerator as NameGenerator } from '../NameGenerator';

const requiredProps = {
  addNodes: jest.fn(),
  getLabel: jest.fn(),
  newNodeAttributes: {},
  nodesForPrompt: [],
  openModal: jest.fn(),
  prompt: {},
  promptBackward: jest.fn(),
  promptForward: jest.fn(),
  stage: {},
  updateNode: jest.fn(),
};

describe('NameGenerator', () => {
  it('does not require a form prop', () => {
    const elem = shallow(<NameGenerator {...requiredProps} />);
    expect(elem.find('Connect(NodeForm)')).toHaveLength(0);
  });

  it('renders a node form if provided in props', () => {
    const props = { ...requiredProps, form: {} };
    const elem = shallow(<NameGenerator {...props} />);
    expect(elem.find('Connect(NodeForm)').length).toBeGreaterThan(0);
  });
});
