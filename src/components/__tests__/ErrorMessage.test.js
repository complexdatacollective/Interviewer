/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { ErrorMessage } from '../ErrorMessage';

const mockProps = {
  errorMessage: 'There was an error',
  acknowledged: false,
  acknowledgeError: () => {},
};

describe('<ErrorMessage />', () => {
  it('renders ok', () => {
    const component = shallow(
      <ErrorMessage {...mockProps} />,
    );

    expect(component).toMatchSnapshot();
  });
});
