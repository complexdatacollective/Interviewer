/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Prompt from '../Prompt';

describe('Prompt component', () => {
  it('renders prompt with markdown', () => {
    const component = shallow(<Prompt label="_prompt_ containing **markdown**" />);

    expect(component).toMatchSnapshot();
  });

  it('renders with active class when isActive', () => {
    expect(shallow(<Prompt isActive />).hasClass('prompts__prompt--active')).toBe(true);

    expect(shallow(<Prompt isActive={false} />).hasClass('prompts__prompt--active')).toBe(false);
  });
});
