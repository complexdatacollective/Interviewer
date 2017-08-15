/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import ToggleGroup from '../fieldComponents';

const setup = (props) => {
  const mockProps = {
    label: 'Toggle group',
    input: { value: null },
    options: ['1', '2', '3'],
    meta: {
      invalid: true,
      error: 'an error message',
    },
    ...props,
  };

  const component = shallow((
    <ToggleGroup store={createStore(() => {})} {...mockProps} />
  ));

  return component;
};

describe('<ToggleGroup />', () => {
  it('should render', () => {
    const subject = setup();

    expect(subject).toMatchSnapshot();
  });
});
