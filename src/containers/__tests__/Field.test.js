/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import * as redux from 'react-redux';
import Field, { getInputComponent } from '../Field';

const spy = vi.spyOn(redux, 'useStore');
spy.mockReturnValue(() => ({}));

const attributes = {
  label: 'Name',
  name: 'name',
  component: 'Alphanumeric',
};

const validation = {
  required: true,
  minLength: 2,
};

const reduxFormFieldProperties = { input: { name: 'foo', value: '' }, meta: { invalid: false } };

describe('getInputComponent()', () => {
  it('should return a dom input', () => {
    const Input = getInputComponent('Text');
    const subject = shallow(<Input {...reduxFormFieldProperties} />);
    expect(subject.find('input')).toHaveLength(1);
  });

  it('If field component is not found it returns an error component', () => {
    const Input = getInputComponent('foobar');
    const subject = shallow(<Input {...reduxFormFieldProperties} />);
    expect(subject.text()).toEqual('Input component "foobar" not found.');
  });

  it('If no field component specified it returns a text input', () => {
    const Input = getInputComponent();
    const subject = shallow(<Input {...reduxFormFieldProperties} />);
    expect(subject.find('input').prop('type')).toEqual('text');
  });
});

describe('<Field />', () => {
  it('should render', () => {
    const subject = shallow((
      <Field {...attributes} />
    ));

    expect(subject).toMatchSnapshot();
  });

  it('Loads validations from the register', () => {
    const field = shallow(<Field {...attributes} validation={validation} />);

    const validate = field.find('Field').prop('validate');

    expect(validate.length).toBe(2);
  });

  it('Loads options with optionsSelector', () => { });
});
