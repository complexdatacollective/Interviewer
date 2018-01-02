/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import ConcentricCircles from '../ConcentricCircles';

const mockProps = {
  prompt: { sociogram: { background: {} } },
  stage: {},
};

describe('<ConcentricCircles />', () => {
  it('renders ok', () => {
    const component = shallow(<ConcentricCircles {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
