/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import FieldComponents from '../fieldComponents';

const setup = (props) => {
  const mockProps = {
    label: 'Radio group',
    input: {
      value: null,
      name: 'radio_group'
    },
    options: ['1', '2', '3'],
    meta: {
      invalid: true,
      error: 'an error message',
    },
    ...props,
  };

  const component = shallow((
    <FieldComponents.RadioGroup store={createStore(() => {})} {...mockProps} />
  ));

  return component;
};

describe('<RadioGroup />', () => {
  it('should render', () => {
    const subject = setup();

    expect(subject).toMatchSnapshot();
  });

  it('should render a toggle for each option', () => {
    const subject = setup();

    expect(subject.find('RadioInput').length).toBe(3);
  });
});
