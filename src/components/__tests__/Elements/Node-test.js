/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Node from '../../Elements/Node';

describe('Node component', () => {
  it('renders ok', () => {
    const component = shallow(<Node label="foo" />);

    expect(component).toMatchSnapshot();
  });
});
