/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ProtocolCard from '../ProtocolCard';

describe('<ProtocolCard>', () => {
  let component;
  let mockProtocol;
  let selectHandler;

  beforeEach(() => {
    selectHandler = jest.fn();
    mockProtocol = { name: 'my-mock-protocol', description: '1.0.1' };
    component = shallow(<ProtocolCard selectProtocol={selectHandler} protocol={mockProtocol} />);
  });

  it('renders an icon', () => {
    expect(component.find('Icon')).toHaveLength(1);
  });

  it('renders name & description', () => {
    expect(component.text()).toMatch(mockProtocol.name);
    expect(component.text()).toMatch(mockProtocol.description);
  });

  it('downloads on click', () => {
    component.simulate('click');
    expect(selectHandler).toHaveBeenCalledTimes(1);
  });
});
