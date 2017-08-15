/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import Numeric from '../fieldComponents';

const setup = (props) => {
  const mockProps = {
    label: 'Numeric',
    meta: {
      invalid: true,
      error: 'an error message',
    },
    ...props,
  };

  const component = shallow((
    <Numeric store={createStore(() => {})} {...mockProps} />
  ));

  return component;
};

describe('<Numeric />', () => {
  it('should render', () => {
    const subject = setup();

    expect(subject).toMatchSnapshot();
  });
});
