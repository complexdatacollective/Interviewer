/* eslint-env jest */

import React from 'react';
import { mount, shallow } from 'enzyme';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import NodeLayout from '../NodeLayout';

describe('Connect(NodeLayout)', () => {
  const mockState = {
    sessions: {},
  };
  const mockProps = {};

  it('provides a nodes prop', () => {
    const subject = shallow(<NodeLayout {...mockProps} store={createStore(() => mockState)} />);
    expect(subject.prop('nodes')).toBeDefined();
  });

  it('provides a drop target', () => {
    const subject = mount(
      <Provider store={createStore(() => mockState)}>
        <NodeLayout {...mockProps} />
      </Provider>);
    expect(subject.find('DropTarget')).toHaveLength(1);
  });
});
