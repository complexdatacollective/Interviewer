/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Field from '../Field';
import FieldComponents from '../../../components/Inputs/fieldComponents';

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
  it('Loads component from the register', () => {
    const field = shallow(<Field {...attributes} />);

    expect(field.find('Field').prop('component')).toBe(FieldComponents.Alphanumeric);
  });

  it('Loads validations from the register', () => {
    const field = shallow(<Field {...attributes} validation={validation} />);

    const validate = field.find('Field').prop('validate');

    expect(validate.length).toBe(2);
  });

  it('Loads options with optionsSelector');
});
