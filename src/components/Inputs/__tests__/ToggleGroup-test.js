/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';

import { ContextInput } from 'network-canvas-ui';
import FieldComponents from '../fieldComponents';

const setup = (props) => {
  const mockProps = {
    label: 'Toggle group',
    input: {
      value: null,
      name: 'toggle_group'
    },
    options: ['1', '2', '3'],
    colors: ['neon-carrot', 'kiwi', 'sea-serpent'],
    meta: {
      invalid: true,
      error: 'an error message',
    },
    ...props,
  };

  const component = shallow((
    <FieldComponents.ToggleGroup store={createStore(() => {})} {...mockProps} />
  ));

  return component;
};

describe('<ToggleGroup />', () => {
  it('should render', () => {
    const subject = setup();

    expect(subject).toMatchSnapshot();
  });

  it('should render a toggle for each option', () => {
    const subject = setup();

    expect(subject.find('ContextInput').length).toBe(3);
  });
});
