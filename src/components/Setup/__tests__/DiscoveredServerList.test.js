/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
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

const mockStore = () =>
  createStore(
    () => (
      {
        installedProtocols: {
          config: {
            registry: {},
          },
        },
      }
    ),
  );

describe('<DiscoveredServerList />', () => {
  let component;
  beforeEach(() => {
    component = mount(<Provider store={mockStore()} ><DiscoveredServerList /></Provider>);
  });

  it('displays listening state', () => {
    expect(component.find('ServerCard')).toHaveLength(0);
    expect(component.text()).toContain('Listening');
  });
});
