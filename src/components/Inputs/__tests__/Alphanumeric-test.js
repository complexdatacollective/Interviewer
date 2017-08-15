/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import FieldComponents from '../fieldComponents';

const setup = (props) => {
  const mockProps = {
    label: 'Alphanumeric',
    input: {
      value: null,
      name: 'alphanumeric_name'
    },
    meta: {
      invalid: true,
      error: 'an error message',
    },
    ...props,
  };

  const component = shallow((
    <FieldComponents.Alphanumeric store={createStore(() => {})} {...mockProps} />
  ));

  return component;
};

describe('<Alphanumeric />', () => {
  it('should render', () => {
    const subject = setup();

    expect(subject).toMatchSnapshot();
  });
});
