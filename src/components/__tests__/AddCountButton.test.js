/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import AddCountButton from '../AddCountButton';

describe('AddCountButton component', () => {
  it('renders a count', () => {
    const count = 321;
    const component = shallow(<AddCountButton count={count} />);
    expect(component.text()).toMatch(String(count));
  });

  it('defaults to empty', () => {
    const component = shallow(<AddCountButton />);
    expect(component.text()).not.toMatch(/\d/);
  });
});
