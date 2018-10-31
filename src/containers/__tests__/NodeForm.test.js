/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeForm } from '../NodeForm';

const mockProps = {
  name: 'baz',
  title: 'The form title',
  onSubmit: () => {},
  fields: [
    {
      variable: 'foo',
      component: 'TextInput',
    },
  ],
  entity: 'node',
  type: 'person',
  closeModal: () => {},
  openModal: () => {},
  resetValues: () => {},
  initialValues: {},
  show: true,
  form: {
    title: 'alpha',
  },
};

describe('<NodeForm />', () => {
  it('with default props', () => {
    const subject = shallow(<NodeForm {...mockProps} />);

    expect(subject.find('FormWizard').prop('controls').length).toBe(1);
  });

  it('should render a toggle to add another with prop', () => {
    const showToggleProps = {
      ...mockProps,
      form: {
        ...mockProps.form,
        optionToAddAnother: true,
      },
    };

    const subject = shallow(<NodeForm {...showToggleProps} />);

    expect(subject.find('FormWizard').prop('controls').length).toBe(2);
  });

  it('should render with prepopulated fields if provided', () => {
    const withInitialValues = {
      ...mockProps,
      initialValues: {
        foo: 'bar',
      },
    };
    const subject = shallow(<NodeForm {...withInitialValues} />);
    expect(
      subject.find('FormWizard').prop('initialValues'),
    ).toEqual({ foo: 'bar' });
  });
});
