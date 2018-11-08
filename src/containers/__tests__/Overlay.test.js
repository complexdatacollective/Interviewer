/* eslint-env jest */
import React from 'react';
import { createStore } from 'redux';
import TestRenderer from 'react-test-renderer';

import ConnectedOverlay, { Overlay } from '../Overlay';

describe('Connect(Overlay)', () => {
  let mockStore;

  beforeEach(() => {
    mockStore = createStore(() => ({
      deviceSettings: {},
    }));
  });

  it('stores a ref to support getWrappedInstance()', () => {
    const ref = React.createRef();
    TestRenderer.create(<ConnectedOverlay ref={ref} store={mockStore} />);
    expect(ref.current.getWrappedInstance).toBeInstanceOf(Function);
    expect(ref.current.getWrappedInstance()).toBeInstanceOf(Overlay);
  });
});
