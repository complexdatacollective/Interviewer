/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import FieldComponents from '../fieldComponents';

const setup = (props) => {
  const mockProps = {
    label: 'Checkbox group',
    input: {
      value: null,
      name: 'checkbox_name'
    },
    options: ['1', '2', '3'],
    meta: {
      invalid: true,
      error: 'an error message',
    },
    ...props,
  };

  const component = shallow(
    <FieldComponents.CheckboxGroup store={createStore(() => {})} {...mockProps} />
  );

  return component;
};

describe('<CheckboxGroup />', () => {
  it('should render', () => {
    const subject = setup();

    expect(subject).toMatchSnapshot();
  });

  it('should render a toggle for each option', () => {
    const subject = setup();

    expect(subject.find('Checkbox').length).toBe(3);
  });
});
