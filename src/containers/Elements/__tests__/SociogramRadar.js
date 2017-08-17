/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import SociogramRadar from '../../Elements/SociogramRadar';

const mockProps = {
  n: 5,
  skewed: true,
};

describe('<SociogramRadar />', () => {
  it('renders ok', () => {
    const component = shallow(<SociogramRadar {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
