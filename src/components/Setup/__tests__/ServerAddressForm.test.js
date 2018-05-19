/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ServerAddressForm from '../ServerAddressForm';

describe('<ServerAddressForm>', () => {
  let component;
  let selectHandler;

  beforeEach(() => {
    selectHandler = jest.fn();
    component = shallow(<ServerAddressForm selectServer={selectHandler} />);
  });

  it('allows selection', () => {
    component.instance().setAddress('localhost');
    component.instance().setPort(9999);
    component.simulate('submit', { preventDefault: jest.fn() });
    expect(selectHandler).toHaveBeenCalledTimes(1);
  });
});
