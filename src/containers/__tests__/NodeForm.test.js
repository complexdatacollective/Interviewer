/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import NodeForm, { NodeForm as NodeFormPure } from '../NodeForm';

jest.mock('../../utils/CSSVariables');

const node = {
  attributes: {
    foo: 'bar',
  },
};

const variableRegistry = {
  node: {
    person: {
      variables: {
        foo: {
          type: 'string',
          label: 'Foo',
        },
      },
    },
  },
};

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
  showAddAnotherToggle: false,
};

const mockStore = () =>
  createStore(() => ({
    protocol: {
      variableRegistry,
    },
    deviceSettings: {
      useFullScreenForms: false,
    },
    modals: [{ name: 'baz', open: true }],
  }));

describe('<NodeForm />', () => {
  it('should render', () => {
    const subject = shallow(<NodeFormPure {...mockProps} />);

    expect(subject).toMatchSnapshot();
  });

  it('should render a toggle to add another with prop', () => {
    const singularForm = mount(
      <Provider store={mockStore()}>
        <NodeForm {...mockProps} />
      </Provider>,
    );

    expect(singularForm.find('form').find('ToggleInput').length).toBe(0);
    expect(singularForm.find('form').find('button').length).toBe(1);

    const showToggleProps = {
      ...mockProps,
      showAddAnotherToggle: true,
    };
    const formWithToggle = mount(
      <Provider store={mockStore()}>
        <NodeForm {...showToggleProps} />
      </Provider>,
    );

    expect(formWithToggle.find('form').find('ToggleInput').length).toBe(1);
    expect(formWithToggle.find('form').find('button').length).toBe(1);
  });

  it('should render with prepopulated fields if provided', () => {
    const subject = mount(
      <Provider store={mockStore()}>
        <NodeForm {...mockProps} node={node} />
      </Provider>,
    );

    expect(
      subject
        .find('Form')
        .first()
        .prop('initialValues'),
    ).toEqual({ foo: 'bar' });
  });
});
