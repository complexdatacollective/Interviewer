/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

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
  introductionPanel: { title: 'intro', text: 'content' },
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
    expect(component.find('.progress-container')).toHaveLength(1);
    expect(component.find('.progress-container--show')).toHaveLength(1);
  });

  it.only('hides scroll notice', () => {
    const component = mount((
      <Provider store={store}>
        <EgoForm {...requiredProps} />
      </Provider>
    ));
    component.find('.ego-form__form-container-scroller').first().simulate('scroll', { deltaY: 10 });
    expect(component.find('.progress-container')).toHaveLength(1);
    expect(component.find('.progress-container--show')).toHaveLength(0);
  });
});
