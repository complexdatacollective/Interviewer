/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import Form from '../Form';
import Field from '../Field';

const mockStore = () =>
  createStore(
    () => (
      {
        protocol: {
          config: {
            registry: {},
          },
        },
      }
    ),
  );

const props = testProps => ({
  form: 'form1',
  fields: [],
  ...testProps,
});

describe('<Form />', () => {
  it('should render', () => {
    const subject = shallow((
      <Form {...props()} store={mockStore()} />
    ));

    expect(subject).toMatchSnapshot();
  });

  it('should render multiple buttons', () => {
    const multipleControls = mount((
      <Form
        {...props()}
        controls={[<button key="one">one</button>, <button key="two">two</button>]}
        store={mockStore()}
      />
    ));
    const singularForm = mount((
      <Form {...props()} store={mockStore()} />
    ));

    expect(multipleControls.find('button').length).toBe(2);
    expect(singularForm.find('button').length).toBe(1);
  });

  it('renders an array of <Field />', () => {
    const fields = [
      {
        label: 'Name',
        name: 'name',
        component: 'TextInput',
        placeholder: 'Name',
        validation: {},
      },
      {
        label: 'Nickname',
        name: 'nickname',
        component: 'TextInput',
        placeholder: 'Nickname',
        validation: {},
      },
    ];

    const subject = mount((
      <Provider store={mockStore()} >
        <Form {...props({ fields })} />
      </Provider>
    ));

    expect(subject.find(Field).length).toBe(2);
  });
  it('Calls autoPopulate on Field blur');
});
