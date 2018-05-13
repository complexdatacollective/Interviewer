/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ServerCard from '../ServerCard';

describe('<ServerCard>', () => {
  let component;
  let selectHandler;

  beforeEach(() => {
    selectHandler = jest.fn();
    component = shallow(<ServerCard selectServer={selectHandler} />);
  });

  it('allows selection', () => {
    component.simulate('click');
    expect(selectHandler).toHaveBeenCalledTimes(1);
  });
});
