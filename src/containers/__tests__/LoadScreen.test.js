/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import LoadScreen from '../LoadScreen';

describe('<LoadScreen />', () => {
  it('should not render', () => {
    const component = mount(
      <Provider store={createStore(() => (
        { protocol: { isLoading: false } }))}
      >
        <LoadScreen />
      </Provider>,
    );

    expect(component.find('.load-screen')).toHaveLength(0);
  });

  it('should render', () => {
    const component = mount(
      <Provider store={createStore(() => (
        { protocol: { isLoading: true } }))}
      >
        <LoadScreen />
      </Provider>,
    );

    expect(component.find('.load-screen')).toHaveLength(1);
  });
});
