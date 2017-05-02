/* eslint-env jest */

import { activePromptAttributes, activeStageAttributes, activeNodeAttributes } from '../session';

describe('session selectors', () => {

  const prompt = {
    nodeAttributes: {
      foo_bar: true,
    },
  };

  const stage = {
    id: 'foo',
    params: {
      nodeType: 'person',
      prompts: [prompt],
    },
  };

  const protocol = {
    protocolConfig: {
      stages: [stage],
    },
  };

  const session = {
    stage: { index: 0 },
    prompt: { index: 0 },
  };

  const state = {
    protocol: protocol,
    session: session,
  };

  it('activePromptAttributes returns the active prompt attributes from state', () => {
    expect(activePromptAttributes(state)).toEqual({
      foo_bar: true,
    });
  });

  it('activeStageAttributes returns the active stage attributes from state', () => {
    expect(activeStageAttributes(state)).toEqual({
      stageId: 'foo',
      type: 'person',
    });
  });

  it('activeNodeAttributes returns the active node attributes from state', () => {
    expect(activeNodeAttributes(state)).toEqual({
      foo_bar: true,
      stageId: 'foo',
      type: 'person',
    });
  });

});
