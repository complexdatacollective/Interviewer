/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';

import ButtonObstacle from '../ButtonObstacle';

describe('ButtonObstacle', () => {
  it('renders a button obstacle', () => {
    const subject = shallow(<ButtonObstacle />);
    expect(subject.dive().find('Button')).toHaveLength(1);
    expect(subject.instance().updateObstacle).toBeInstanceOf(Function);
  });
});
