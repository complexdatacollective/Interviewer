/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedCategoricalBin as CategoricalBin } from '../CategoricalBin';

const requiredProps = {
  nodesForPrompt: [],
  prompt: {},
  stage: {},
  promptBackward: jest.fn(),
  promptForward: jest.fn(),
};

describe('CategoricalBin', () => {
  it('renders CategoricalBin interface', () => {
    const component = shallow(<CategoricalBin {...requiredProps} />);
    expect(component).toMatchSnapshot();
  });
});
