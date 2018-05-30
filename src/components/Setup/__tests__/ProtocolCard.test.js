/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ProtocolCard from '../ProtocolCard';

describe('<ProtocolCard>', () => {
  let component;
  let mockProtocol;
  let downloadHandler;

  beforeEach(() => {
    downloadHandler = jest.fn();
    mockProtocol = { name: 'my-mock-protocol', version: '1.0.1' };
    component = shallow(<ProtocolCard download={downloadHandler} protocol={mockProtocol} />);
  });

  it('renders an icon', () => {
    expect(component.find('Icon')).toHaveLength(1);
  });

  it('renders name & version', () => {
    expect(component.text()).toMatch(mockProtocol.name);
    expect(component.text()).toMatch(mockProtocol.version);
  });

  it('downloads on click', () => {
    component.simulate('click');
    expect(downloadHandler).toHaveBeenCalledTimes(1);
  });
});
