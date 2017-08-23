/* eslint-env jest */

import React from 'react';
import { shallow, render } from 'enzyme';
import Field, { renderInput } from '../Field';
import {
  TextInput as Alphanumeric,
  RadioGroup,
  ToggleGroup as SwitchGroup,
} from 'network-canvas-ui';

const attributes = {
  label: 'Name',
  name: 'name',
  type: 'Alphanumeric',
};

const validation = {
  required: true,
  minLength: 2,
};

describe('Containers/Elements/Field', () => {
  it('renders the input', () => {
    const field = shallow(<Field {...attributes} />);

    expect(field.find('Field').prop('component')).toBe(renderInput);
  });

  it('Loads validations from the register', () => {
    const field = shallow(<Field {...attributes} validation={validation} />);

    const validate = field.find('Field').prop('validate');

    expect(validate.length).toBe(2);
  });

  it('Loads options with optionsSelector');
});
