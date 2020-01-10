/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { PromptSwiper } from '../PromptSwiper';

jest.mock('@codaco/ui/lib/utils/CSSVariables');

const mockProps = {
  forward: () => {},
  backward: () => {},
  prompts: [
    { text: 'bar' },
    { text: 'foo' },
  ],
  promptIndex: 0,
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
    const prompts = [{ text: 'baz' }];
    const component = shallow(<PromptSwiper {...mockProps} prompts={prompts} />);

    expect(component.find('.prompts__pips').exists()).toBe(false);
  });
});
