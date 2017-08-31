/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Sociogram from '../../Elements/Sociogram';

const mockProps = {
  prompt: { sociogram: { background: {} } },
  stage: {},
};

describe('<Sociogram />', () => {
  it('renders ok', () => {
    const component = shallow(<Sociogram {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
