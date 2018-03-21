/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Menu from '../Menu';

jest.mock('../../utils/CSSVariables');

const items = [
  { id: 'a', label: 'a title', to: 'a-to' },
  { id: 'b', label: 'b title', to: 'b-to' },
  { id: 'c', label: 'c title', to: 'c-to' },
];

describe('Menu component', () => {
  it('renders menu with list', () => {
    const component = shallow(
      <Menu items={items} isOpen={false} toggleMenu={() => {}} />,
    );

    expect(component).toMatchSnapshot();
  });

  // TODO flush out tests, but the Menu is calling document.getElementById instead of using refs
});
