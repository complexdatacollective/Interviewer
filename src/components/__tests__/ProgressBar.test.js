/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import ProgressBar from '../ProgressBar';

describe('ProgressBar component', () => {
  it('renders ProgressBar', () => {
    const component = shallow(<ProgressBar percentProgress="40" />);

    expect(component).toMatchSnapshot();
  });
});
