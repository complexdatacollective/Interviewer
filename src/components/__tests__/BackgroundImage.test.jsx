/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { BackgroundImage } from '../BackgroundImage';

const mockProps = {
  url: 'foo',
  style: { width: '100%' },
  miscellaneousAdditionalProperty: 'baz',
};

describe('<BackgroundImage />', () => {
  it('renders ok', () => {
    const component = shallow(
      <BackgroundImage {...mockProps} />,
    );

    expect(component).toMatchSnapshot();
  });
});
