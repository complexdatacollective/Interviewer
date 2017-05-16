/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Panel from '../../Elements/Panel';

describe('Panel component', () => {
  it('renders ok', () => {
    const component = shallow(
      <Panel title="foo"><span>bar</span></Panel>,
    );

    expect(component).toMatchSnapshot();
  });
});
