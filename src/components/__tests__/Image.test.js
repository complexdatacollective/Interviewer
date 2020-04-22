/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { Image } from '../Image';

const mockProps = {
  url: 'foo',
  alt: 'baz',
  miscellaneousAdditionalProperty: 'baz',
};

describe('<Image />', () => {
  it('renders ok', () => {
    const component = shallow(
      <Image {...mockProps} />,
    );

    expect(component).toMatchSnapshot();
  });
});
