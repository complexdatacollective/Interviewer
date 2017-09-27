/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import SociogramBackground from '../../Elements/SociogramBackground';

const mockPropsForRadar = {
  n: 5,
  skewed: true,
};

const mockPropsForImage = {
  image: 'map.png',
};

describe('<SociogramBackground />', () => {
  it('renders ok for radar', () => {
    const component = shallow(<SociogramBackground {...mockPropsForRadar} />);

    expect(component).toMatchSnapshot();
  });

  it('renders ok for image', () => {
    const component = shallow(<SociogramBackground {...mockPropsForImage} />);

    expect(component).toMatchSnapshot();
  });
});
