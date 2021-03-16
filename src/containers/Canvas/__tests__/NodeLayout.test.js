/* eslint-env jest */

import React from 'react';
import { mount } from 'enzyme';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import NodeLayout from '../NodeLayout';

describe('Connect(NodeLayout)', () => {
  const mockState = {
    sessions: {},
  };
  const mockProps = {
    nodes: [],
    edges: [],
  };

  it('provides a drop target', () => {
    const subject = mount(
      <Provider store={createStore(() => mockState)}>
        <NodeLayout {...mockProps} />
      </Provider>);
    expect(subject.find('DropTarget')).toHaveLength(1);
  });
});
