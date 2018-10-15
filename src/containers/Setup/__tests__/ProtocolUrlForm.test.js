/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import ProtocolUrlForm from '../ProtocolUrlForm';

const isSumbitButton = btn => btn.prop('type') !== 'reset' && btn.prop('type') !== 'button';

describe('ProtocolUrlForm', () => {
  let component;

  beforeEach(() => {
    const state = { protocol: {} };
    // Provider is required for the inner ReduxForm
    component = mount((
      <Provider store={createStore(() => state)} >
        <ProtocolUrlForm />
      </Provider>
    ));
  });

  it('has a submit button that imports', () => {
    const submitButton = component.find('button').filterWhere(isSumbitButton);
    expect(submitButton).toHaveLength(1);
    expect(submitButton.text()).toMatch('Import');
  });
});
