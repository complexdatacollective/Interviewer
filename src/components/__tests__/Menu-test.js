/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';
import Menu from '../Menu';

const items = [{ id: 'a', title: 'a title', to: 'a-to' },
          { id: 'b', title: 'b title', to: 'b-to' },
          { id: 'c', title: 'c title', to: 'c-to' }];

describe('Menu component', () => {
  it('renders menu with list', () => {
    const component = renderer.create(
      <Menu items={items} isOpen={false} toggleMenu={() => {}} />,
    );
    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  // TODO flush out tests, but the Menu is calling document.getElementById instead of using refs
});
