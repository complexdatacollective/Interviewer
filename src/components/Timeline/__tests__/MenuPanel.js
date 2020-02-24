/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';

import MenuPanel from '../MenuPanel';

describe('MenuPanel component', () => {
  it('triggers clickInactive handler if inactive', () => {
    const handleClick = jest.fn();
    const subject = shallow(<MenuPanel onClickInactive={handleClick} />);
    subject.simulate('click');
    expect(handleClick).toHaveBeenCalled();
  });

  it('ignored clickInactive if active', () => {
    const handleClick = jest.fn();
    const subject = shallow(<MenuPanel active onClickInactive={handleClick} />);
    subject.simulate('click');
    expect(handleClick).not.toHaveBeenCalled();
  });
});
