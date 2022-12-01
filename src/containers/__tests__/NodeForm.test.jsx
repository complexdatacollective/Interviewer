/* eslint-env jest */


import React from 'react';
import { shallow } from 'enzyme';
import { NodeForm } from '../NodeForm';

const mockProps = {
  name: 'baz',
  title: 'The form title',
  onSubmit: () => { },
  fields: [
    {
      variable: 'foo',
      component: 'Text',
    },
  ],
  closeModal: () => { },
  openModal: () => { },
  resetValues: () => { },
  initialValues: {},
  show: true,
  stage: {
    subject: {
      entity: 'node',
      type: 'person',
    },
  },
  useFullScreenForms: true,
  form: {
    title: 'alpha',
  },
};

describe('<NodeForm />', () => {
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
