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

  it('calls the completion handler', () => {
    component.find('form').simulate('submit', mockSubmitEvt);
    expect(completeHandler).toHaveBeenCalledTimes(1);
  });

  it('prevents default form submit', () => {
    component.find('form').simulate('submit', mockSubmitEvt);
    expect(mockSubmitEvt.preventDefault).toHaveBeenCalledTimes(1);
  });
});
