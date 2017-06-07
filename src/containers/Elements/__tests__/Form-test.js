/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import Form from '../Form';
import Field from '../Field';

const setup = (props) => {
  const mockProps = {
    form: 'form1',
    fields: [],
    ...props,
  };

  const component = mount((
    <Provider store={createStore(() => {})} >
      <Form {...mockProps} />
    </Provider>
  ));

  return {
    component,
    fields: component.find(Field),
  };
};

describe('<Form />', () => {
  // it('should render', () => {
  //   const subject = setup();
  //
  //   expect(subject.component).toMatchSnapshot();
  // });

  it('renders an array of <Field />', () => {
    const fields = [
      {
        label: 'Name',
        name: 'name',
        type: 'Alphanumeric',
        placeholder: 'Name',
        validation: {},
      },
      {
        label: 'Nickname',
        name: 'nickname',
        type: 'Alphanumeric',
        placeholder: 'Nickname',
        validation: {},
      },
    ];

    const subject = setup({ fields });

    expect(subject.fields.length).toBe(2);
  });
  it('Calls autoPopulate on Field blur');
});
