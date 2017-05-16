/* eslint-env jest */

import React from 'react';
import renderer from 'react-test-renderer';
import Menu from '../Menu';

const items = [{},
          {},
          {}];

describe('Menu component', () => {
  it('renders menu with list', () => {
    const component = renderer.create(
      <Menu items={items} />,
    );
    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  // TODO flush out tests, but the Menu is calling document.getElementById instead of using refs
});
