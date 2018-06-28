/* eslint-env jest */

import React from 'react';
import { shallow, mount } from 'enzyme';
import { createStore } from 'redux';

import SessionList from '../SessionList';

const mockReduxState = {
  protocols: [],
  sessions: {
    a: { protocolPath: 'p', name: 'a name', network: { nodes: [0, 1, 2], edges: [0] }, path: '/path/to/a', promptIndex: 2, updatedAt: 1528213062793 },
    b: { protocolPath: 'p', name: 'b name', network: { nodes: [], edges: [] }, path: '/path/to/b', promptIndex: 1, updatedAt: 1528218451710 },
  },
};

describe('<SessionList />', () => {
  it('renders ok', () => {
    const component = shallow(<SessionList store={createStore(() => mockReduxState)} />);
    expect(component).toMatchSnapshot();
  });

  it('shows sessions as cards', () => {
    const component = mount(<SessionList store={createStore(() => mockReduxState)} />);
    expect(component.find('.card').length).toBe(2);
  });

  it('hides sessions without protocols', () => {
    const validSessions = mockReduxState.sessions;
    const invalidSession = { name: 'no-protocol' };
    const state = { protocols: [], sessions: { ...validSessions, invalidSession } };
    const component = mount(<SessionList store={createStore(() => state)} />);
    expect(component.find('.card').length).toBe(Object.values(validSessions).length);
  });
});
