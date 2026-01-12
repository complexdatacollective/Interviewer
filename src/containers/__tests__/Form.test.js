/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import Form from '../Form';
import Field from '../Field';

vi.mock('@codaco/ui/lib/utils/CSSVariables');

const mockStore = () => createStore(
  () => (
    {
      installedProtocols: {
        config: {
          registry: {},
        },
      },
    }
  ),
);

const props = (testProps) => ({
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

  it('should render custom button', () => {
    const customSubmit = mount((
      <Form
        {...props()}
        submitButton={<button key="customSubmit" className="custom" type="button">Custom Submit</button>}
        store={mockStore()}
      />
    ));
    const defaultSubmit = mount((
      <Form {...props()} store={mockStore()} />
    ));
    expect(customSubmit.find('.custom').length).toBe(1);
    expect(defaultSubmit.find('.custom').length).toBe(0);
    expect(defaultSubmit.find('button').length).toBe(1);
  });

  it('renders an array of <Field />', () => {
    const fields = [
      {
        label: 'Name',
        name: 'name',
        component: 'Text',
        placeholder: 'Name',
        validation: {},
      },
      {
        label: 'Nickname',
        name: 'nickname',
        component: 'Text',
        placeholder: 'Nickname',
        validation: {},
      },
    ];

    const subject = mount((
      <Provider store={mockStore()}>
        <Form {...props({ fields })} />
      </Provider>
    ));

    expect(subject.find(Field).length).toBe(2);
  });
  it('Calls autoPopulate on Field blur', () => {});
});
