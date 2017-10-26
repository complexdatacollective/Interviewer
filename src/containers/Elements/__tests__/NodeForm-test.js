/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import NodeForm from '../NodeForm';

window.matchMedia = window.matchMedia || (() => ({
  matches: false, addListener: () => {}, removeListener: () => {},
}));

const node = {
  foo: 'bar',
};

const registry = {
  foo: {
    type: 'string',
    label: 'Foo',
  },
};

const mockStore = () =>
  createStore(
    () => (
      {
        protocol: {
          config: {
            registry,
          },
        },
        modals: [
          { name: 'baz', open: true },
        ],
      }
    ),
  );

const mockProps = {
  name: 'baz',
  title: 'The form title',
  handleSubmit: () => {},
  fields: [{
    variable: 'foo',
    component: 'TextInput',
  }],
};

describe('<NodeForm />', () => {
  it('should render', () => {
    const subject = shallow((
      <NodeForm {...mockProps} store={mockStore()} />
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
