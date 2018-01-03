/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Panel from '../Panel';

describe('Panel component', () => {
  it('renders ok', () => {
    const component = shallow(
      <Panel title="foo"><span>bar</span></Panel>,
    );

    expect(component).toMatchSnapshot();
  });

  it('updates class when title clicked', () => {
    const component = shallow(
      <Panel title="foo"><span>bar</span></Panel>,
    );

    expect(component.hasClass('panel--collapsed')).toBe(false);

    // clicking once collapses panel
    component.find('.panel__heading').simulate('click');
    expect(component.hasClass('panel--collapsed')).toBe(true);

    // clicking again expands panel
    component.find('.panel__heading').simulate('click');
    expect(component.hasClass('panel--collapsed')).toBe(false);
  });
});
