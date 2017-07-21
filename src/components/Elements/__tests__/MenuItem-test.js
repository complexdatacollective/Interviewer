/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import MenuItem from '../../Elements/MenuItem';

const toLink = 'linkyLink';
const onClick = () => {};
const imageType = 'type';
const title = 'title';

describe('MenuItem component', () => {
  it('renders menu item with title', () => {
    const component = shallow(
      <MenuItem to={toLink} onClick={onClick} imageType={imageType} title={title} />,
    );

    expect(component).toMatchSnapshot();
  });

  it('renders menu item with no image', () => {
    const component = shallow(
      <MenuItem to={toLink} onClick={onClick} title={title} />,
    );

    expect(component).toMatchSnapshot();
  });
});
