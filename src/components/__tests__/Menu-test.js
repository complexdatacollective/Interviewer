/* eslint-env jest */

import React from 'react';
import Menu from '../Menu';
import renderer from 'react-test-renderer';

const items = [{},
          {},
          {}];

describe('Menu component', () => {
  it('renders menu with list', () => {
    const component = renderer.create(
      <Menu items={items} />
    );
    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });

  // TODO flush out tests, but the Menu is calling document.getElementById instead of using refs so some refactoring is needed.
});
