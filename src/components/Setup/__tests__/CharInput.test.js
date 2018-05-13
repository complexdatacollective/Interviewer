/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import CharInput from '../CharInput';

describe('<CharInput>', () => {
  let component;
  let changeHandler;

  beforeEach(() => {
    changeHandler = jest.fn();
    component = shallow(<CharInput value="x" index={0} onChange={changeHandler} />);
  });

  it('renders an input', () => {
    expect(component.find('input')).toHaveLength(1);
  });

  it('bubbles change event from input', () => {
    component.find('input').simulate('change');
    expect(changeHandler).toHaveBeenCalled();
  });

  it('highlights invalid characters', () => {
    component = shallow(<CharInput value="😀" index={0} onChange={changeHandler} />);
    expect(component.find('input').prop('className')).toMatch('error');
  });
});
