/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ServerAddressForm from '../ServerAddressForm';

const isSumbitButton = btn => btn.prop('type') !== 'reset' && btn.prop('type') !== 'button';

describe('<ServerAddressForm>', () => {
  let component;
  let selectHandler;

  beforeEach(() => {
    selectHandler = jest.fn();
    component = shallow(<ServerAddressForm selectServer={selectHandler} onCancel={jest.fn()} />);
  });

  it('allows selection', () => {
    component.instance().setAddress('localhost');
    component.instance().setPort(9999);
    component.simulate('submit', { preventDefault: jest.fn() });
    expect(selectHandler).toHaveBeenCalledTimes(1);
  });

  it('has a submit button that pairs', () => {
    const submitButton = component.find('Button').filterWhere(isSumbitButton);
    expect(submitButton).toHaveLength(1);
    expect(submitButton.prop('content')).toEqual('Pair');
  });

  it('has a cancel button', () => {
    const cancelButton = component.find('Button').filterWhere(btn => !isSumbitButton(btn));
    expect(cancelButton).toHaveLength(1);
    expect(cancelButton.children().text()).toEqual('Cancel');
  });
});
