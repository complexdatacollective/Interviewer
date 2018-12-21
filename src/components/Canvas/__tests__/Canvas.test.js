/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';

import Canvas from '../Canvas';

describe('<Canvas />', () => {
  it('renders children in a canvas', () => {
    const subject = shallow(<Canvas>foo</Canvas>);
    expect(subject.find('.canvas')).toHaveLength(1);
    expect(subject.childAt(0).text()).toEqual('foo');
  });
});
