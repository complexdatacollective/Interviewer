/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import Form from '../Form';
import Field from '../Field';

const props = testProps => ({
  form: 'form1',
  fields: [],
  ...testProps,
});

describe('<Form />', () => {
  it('should render', () => {
    const subject = shallow((
      <Form {...props()} store={createStore(() => {})} />
    ));

    expect(subject).toMatchSnapshot();
  });

  it('should render add another button', () => {
    const continuousForm = mount((
      <Form {...props()} addAnother store={createStore(() => {})} />
    ));
    const singularForm = mount((
      <Form {...props()} store={createStore(() => {})} />
    ));

    expect(continuousForm.find('button').length).toBe(2)
    expect(singularForm.find('button').length).toBe(1)
  });

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

    const subject = mount((
      <Provider store={createStore(() => {})} >
        <Form {...props({ fields })} />
      </Provider>
    ));

    expect(subject.find(Field).length).toBe(2);
  });
  it('Calls autoPopulate on Field blur');
});
