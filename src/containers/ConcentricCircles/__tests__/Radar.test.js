/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Radar from '../Radar';

jest.mock('../../../utils/CSSVariables');

const mockProps = {
  n: 5,
  skewed: true,
};

describe('<Radar />', () => {
  it('renders ok', () => {
    const component = shallow(<Radar {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
