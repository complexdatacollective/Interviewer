/* eslint-env jest */


import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { EgoForm } from '../EgoForm';

const requiredProps = {
  form: {
    title: 'alpha',
    entity: 'ego',
  },
  introductionPanel: { title: 'intro', text: 'text' },
  ego: {},
  formEnabled: jest.fn(),
  submitForm: jest.fn(),
  updateEgo: jest.fn(),
  registerBeforeNext: jest.fn(),
  isFormValid: jest.fn(() => true),
};

const store = createStore(() => ({
  ui: {
    FORM_IS_READY: false,
  },
}));

describe('EgoForm', () => {
  it('renders EgoForm interface', () => {
    const component = mount((
      <Provider store={store}>
        <EgoForm {...requiredProps} />
      </Provider>
    ));
    expect(component.find('Connect(AutoInitialisedForm)')).toHaveLength(1);
  });
});
