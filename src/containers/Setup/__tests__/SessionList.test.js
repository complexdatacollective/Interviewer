/* eslint-env jest */

import React from 'react';
import { shallow, mount } from 'enzyme';
import { createStore } from 'redux';

import SessionList from '../SessionList';

const mockReduxState = {
  protocols: [],
  sessions: { a: { name: 'a name', network: { nodes: [0, 1, 2], edges: [0] }, path: '/path/to/a', promptIndex: 2, updatedAt: 1528213062793 },
    b: { name: 'b name', network: { nodes: [], edges: [] }, path: '/path/to/b', promptIndex: 1, updatedAt: 1528218451710 } },
};

describe('<SessionList />', () => {
  it('renders ok', () => {
    const component = shallow(<SessionList store={createStore(() => mockReduxState)} />);
    expect(component).toMatchSnapshot();
  });

  const somestore = createStore(() => mockReduxState);
  const component = mount(<SessionList store={somestore} />);
  it('shows sessions as cards', () => {
    expect(component.find('.card').length).toBe(2);
  });
});
