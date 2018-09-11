/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { createStore } from 'redux';

import withPrompt from '../withPrompt';

jest.mock('../../selectors/session', () => ({
  getPromptForCurrentSession: jest.fn().mockReturnValue(99),
  stages: jest.fn().mockReturnValue([{}]),
}));

describe('withPrompt', () => {
  const MockWithPrompt = withPrompt(() => (<div />));
  const mockState = {
    session: '1',
    sessions: {},
    protocol: {
      stages: [{}, {}],
    },
  };

  it('gets prompt from promptId', () => {
    const subj = shallow(<MockWithPrompt promptId={2} store={createStore(() => mockState)} />);
    expect(subj.prop('promptIndex')).toBe(2);
  });

  it('gets cached prompt when promptId not set', () => {
    const subj = shallow(<MockWithPrompt store={createStore(() => mockState)} />);
    expect(subj.prop('promptIndex')).toBe(99);
  });

  it('gets prompt from promptId when 0', () => {
    const subj = shallow(<MockWithPrompt promptId={0} store={createStore(() => mockState)} />);
    expect(subj.prop('promptIndex')).toBe(0);
  });
});
