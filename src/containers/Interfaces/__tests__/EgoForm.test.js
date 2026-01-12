/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
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
  introductionPanel: { title: 'intro', text: 'text' },
  ego: {},
  formEnabled: vi.fn(),
  submitForm: vi.fn(),
  updateEgo: vi.fn(),
  registerBeforeNext: vi.fn(),
  isFormValid: vi.fn(() => true),
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
