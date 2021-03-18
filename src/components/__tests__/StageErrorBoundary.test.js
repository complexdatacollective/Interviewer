/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';

import StageErrorBoundary from '../StageErrorBoundary';

describe('StageErrorBoundary', () => {
  const text = 'No error Here';
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<StageErrorBoundary><div>{text}</div></StageErrorBoundary>);
  });

  it('renders children when no error', () => {
    expect(wrapper.text()).toEqual(text);
  });

  it('renders an error', () => {
    const errMsg = 'Mock error';
    wrapper.setState({ error: new Error(errMsg) });
    expect(wrapper.text()).toContain(errMsg);
  });
});
