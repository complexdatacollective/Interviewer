/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { PromptSwiper } from '../PromptSwiper';

jest.mock('@codaco/ui/lib/utils/CSSVariables');

const prompts = [
  { text: 'bar' },
  { text: 'foo' },
];

const mockProps = {
  forward: () => {},
  backward: () => {},
  prompts,
  promptIndex: 0,
  prompt: prompts[0],
};

describe('<PromptSwiper />', () => {
  it('renders ok', () => {
    const component = shallow(<PromptSwiper {...mockProps} />);

    expect(component.find('.prompts__pips').exists()).toBe(true);
    expect(component).toMatchSnapshot();
  });

  it('shows minimize button', () => {
    const component = shallow(<PromptSwiper {...mockProps} minimizable />);

    expect(component.find('.prompts__minimizer').exists()).toBe(true);
    expect(component.find('.prompts--minimized').exists()).toBe(false);
    component.find('.prompts__minimizer').simulate('click');
    expect(component.find('.prompts--minimized').exists()).toBe(true);
  });
});

describe("when only one prompt, don't show pips", () => {
  it('renders ok', () => {
    const prompts2 = [{ text: 'baz' }];
    const component = shallow(
      <PromptSwiper {...mockProps} prompts={prompts2} prompt={prompts2[0]} />,
    );

    expect(component.find('.prompts__pips').exists()).toBe(false);
  });
});
