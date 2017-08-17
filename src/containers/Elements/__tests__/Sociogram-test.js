/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Sociogram from '../../Elements/Sociogram';

describe('<Sociogram />', () => {
  it('renders ok', () => {
    const component = shallow(<Sociogram>Foo</Sociogram>);

    expect(component).toMatchSnapshot();
  });
});
