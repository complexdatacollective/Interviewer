/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ServerPairingForm from '../ServerPairingForm';

describe('<ServerPairingForm>', () => {
  let component;
  let completeHandler;
  let mockSubmitEvt;

  beforeEach(() => {
    completeHandler = jest.fn();
    mockSubmitEvt = { preventDefault: jest.fn() };
    component = shallow(<ServerPairingForm completePairing={completeHandler} />);
  });

  it('renders a form', () => {
    expect(component.find('form')).toHaveLength(1);
  });

  it('renders a submit button', () => {
    expect(component.find('Button').prop('type')).toEqual('submit');
  });

  it('calls the completion handler', () => {
    component.setState({ submittable: true });
    component.find('form').simulate('submit', mockSubmitEvt);
    expect(completeHandler).toHaveBeenCalledTimes(1);
  });

  it('will not call the completion handler unless submittable', () => {
    component.find('form').simulate('submit', mockSubmitEvt);
    expect(completeHandler).not.toHaveBeenCalled();
  });

  it('prevents default form submit', () => {
    component.find('form').simulate('submit', mockSubmitEvt);
    expect(mockSubmitEvt.preventDefault).toHaveBeenCalledTimes(1);
  });
});
