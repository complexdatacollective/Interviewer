/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import Card from '../Card';

describe('Card component', () => {
  it('renders unselected card', () => {
    const component = shallow(
      <Card selected={false} label="name" details={[{ age: '33' }]} />,
    );

    expect(component).toMatchSnapshot();
  });

  it('renders selected card', () => {
    const component = shallow(
      <Card selected label="name" details={[{ age: '33' }, { fullname: 'full name' }]} />,
    );

    expect(component).toMatchSnapshot();
  });
});
