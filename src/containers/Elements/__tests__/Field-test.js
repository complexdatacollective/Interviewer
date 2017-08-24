/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Field, { renderInput } from '../Field';

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
  it('should render', () => {
    const subject = shallow((
      <Field {...attributes} />
    ));

    expect(subject).toMatchSnapshot();
  });

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
