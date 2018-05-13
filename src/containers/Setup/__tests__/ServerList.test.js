/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';

import ServerList from '../ServerList';

jest.mock('../../../utils/serverDiscoverer', () => jest.fn().mockImplementation(() => ({
  init: jest.fn(),
  on: jest.fn(),
})));

jest.mock('../../../utils/Environment', () => ({
  isCordova: () => false,
  isElectron: () => true,
}));

describe('ServerList component', () => {
  let component;
  beforeEach(() => {
    component = mount(<ServerList />);
  });

  it('displays listening state', () => {
    expect(component.find('ServerCard')).toHaveLength(0);
    expect(component.text()).toContain('Listening');
  });

  it('displays servers', () => {
    component.setState({ servers: [{ name: 'nc' }] });
    expect(component.find('ServerCard')).toHaveLength(1);
  });
});
