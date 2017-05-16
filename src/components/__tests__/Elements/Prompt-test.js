/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Prompt from '../../Elements/Prompt';

describe('Prompt component', () => {
  it('renders prompt with title', () => {
    const component = shallow(<Prompt label="foo" />);

    expect(component.text()).toBe('foo');
  });

  it('renders with active class when isActive', () => {
    expect(shallow(<Prompt isActive />).hasClass('prompts__prompt--active')).toBe(true);

    expect(shallow(<Prompt isActive={false} />).hasClass('prompts__prompt--active')).toBe(false);
  });
});
