/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';

import DiscoveredServerList from '../DiscoveredServerList';

jest.mock('../../../utils/serverDiscoverer', () => jest.fn().mockImplementation(() => ({
  init: jest.fn(),
  on: jest.fn(),
})));

jest.mock('../../../utils/Environment', () => ({
  isCordova: () => false,
  isElectron: () => true,
}));

describe('<DiscoveredServerList />', () => {
  let component;
  beforeEach(() => {
    component = mount(<DiscoveredServerList />);
  });

  it('displays listening state', () => {
    expect(component.find('ServerCard')).toHaveLength(0);
    expect(component.text()).toContain('Listening');
  });

  it('displays servers', () => {
    component.setState({ servers: [{ name: 'nc', addresses: [] }] });
    expect(component.find('ServerCard')).toHaveLength(1);
  });
});
