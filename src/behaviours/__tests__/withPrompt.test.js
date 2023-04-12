/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { createStore } from 'redux';

import withPrompt from '../withPrompt';

describe('withPrompt', () => {
  const MockWithPrompt = withPrompt(() => (<div />));

  const mockState = {
    activeSessionId: 'session1',
    sessions: {
      session1: {
        protocolUID: 'mockProtocol',
        promptIndex: 99,
      },
    },
    installedProtocols: {
      mockProtocol: {
        codebook: {
          node: {},
          edge: {},
          ego: {},
        },
        stages: [{}, {}],
      },
    },
  };

  it('gets prompt from promptId', () => {
    const subj = shallow(<MockWithPrompt promptId={2} store={createStore(() => mockState)} />);
    expect(subj.props().children.props.promptIndex).toBe(2);
  });

  it('gets cached prompt when promptId not set', () => {
    const subj = shallow(<MockWithPrompt store={createStore(() => mockState)} />);
    expect(subj.props().children.props.promptIndex).toBe(99);
  });

  it('gets prompt from promptId when 0', () => {
    const subj = shallow(<MockWithPrompt promptId={0} store={createStore(() => mockState)} />);
    expect(subj.props().children.props.promptIndex).toBe(0);
  });
});
