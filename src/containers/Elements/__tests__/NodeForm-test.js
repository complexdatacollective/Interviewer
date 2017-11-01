/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import NodeForm, { NodeForm as NodeFormPure } from '../NodeForm';

window.matchMedia = window.matchMedia || (() => ({
  matches: false, addListener: () => {}, removeListener: () => {},
}));

const node = {
  foo: 'bar',
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
  fields: [{
    variable: 'foo',
    component: 'TextInput',
  }],
  entity: 'node',
  type: 'person',
  closeModal: () => {},
  openModal: () => {},
  resetValues: () => {},
  initialValues: {},
};

const mockStore = () =>
  createStore(
    () => (
      {
        protocol: {
          variableRegistry,
        },
        modals: [
          { name: 'baz', open: true },
        ],
      }
    ),
  );

describe('<NodeForm />', () => {
  it('should render', () => {
    const subject = shallow((
      <NodeFormPure {...mockProps} />
    ));

    expect(subject).toMatchSnapshot();
  });

  it('should render add another button', () => {
    const multipleControls = mount((
      <Provider store={mockStore()}>
        <NodeForm {...mockProps} addAnother />
      </Provider>
    ));
    const singularForm = mount((
      <Provider store={mockStore()}>
        <NodeForm {...mockProps} />
      </Provider>
    ));

    expect(multipleControls.find('form').find('button').length).toBe(2);
    expect(singularForm.find('form').find('button').length).toBe(1);
  });

  it('should render with prepopulated fields if provided', () => {
    const subject = mount((
      <Provider store={mockStore()}>
        <NodeForm {...mockProps} node={node} />
      </Provider>
    ));

    expect(subject.find('Form').first().prop('initialValues')).toEqual({ foo: 'bar' });
  });
});
