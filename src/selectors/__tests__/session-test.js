/* eslint-env jest */

import { activePromptAttributes, activeStageAttributes, activeOriginAttributes, newNodeAttributes } from '../session';

describe('session selectors', () => {
  const prompt = {
    id: 'baz',
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
    config: {
      stages: [stage],
    },
  };

  const session = {
    stage: { index: 0 },
    prompt: { index: 0 },
  };

  const state = {
    protocol,
    session,
  };

  it('activePromptAttributes returns the active prompt attributes from state', () => {
    expect(activePromptAttributes(state)).toEqual({
      foo_bar: true,
    });
  });

  it('activeStageAttributes returns the active stage attributes from state', () => {
    expect(activeStageAttributes(state)).toEqual({
      type: 'person',
    });
  });

  it('activeOriginAttributes returns the active origin attributes from state', () => {
    expect(activeOriginAttributes(state)).toEqual({
      stageId: 'foo',
      promptId: 'baz',
    });
  });

  it('newNodeAttributes returns the active origin attributes from state', () => {
    expect(newNodeAttributes(state)).toEqual({
      foo_bar: true,
      type: 'person',
      stageId: 'foo',
      promptId: 'baz',
    });
  });
});
