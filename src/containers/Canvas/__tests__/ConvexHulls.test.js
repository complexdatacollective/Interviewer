/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { createStore } from 'redux';

import ConvexHulls from '../ConvexHulls';

describe('Connect(ConvexHulls)', () => {
  const mockState = {
    sessions: {},
    protocol: { codebook: {} },
  };
  const mockProps = {
    subject: {},
  };
  const subject = shallow(<ConvexHulls {...mockProps} store={createStore(() => mockState)} />);

  it('provides a nodesByGroup prop', () => {
    expect(subject.prop('nodesByGroup')).toBeDefined();
  });

  it('provides a categoricalOptions prop', () => {
    expect(subject.prop('categoricalOptions')).toBeDefined();
  });
});
