/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedCategoricalBin as CategoricalBin } from '../CategoricalBin';

const requiredProps = {
  nodesForPrompt: [],
  prompt: {},
  stage: {},
  promptBackward: vi.fn(),
  promptForward: vi.fn(),
};

describe('CategoricalBin', () => {
  it('renders CategoricalBin interface', () => {
    const component = shallow(<CategoricalBin {...requiredProps} />);
    expect(component).toMatchSnapshot();
  });
});
