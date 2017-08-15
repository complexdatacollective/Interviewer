/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import CheckboxGroup from '../fieldComponents';

const setup = (props) => {
  const mockProps = {
    label: 'Checkbox group',
    input: { value: null },
    options: ['1', '2', '3'],
    meta: {
      invalid: true,
      error: 'an error message',
    },
    ...props,
  };

  const component = shallow((
    <CheckboxGroup store={createStore(() => {})} {...mockProps} />
  ));

  return component;
};

describe('<CheckboxGroup />', () => {
  it('should render', () => {
    const subject = setup();

    expect(subject).toMatchSnapshot();
  });
});
