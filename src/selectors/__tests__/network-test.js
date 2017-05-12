/* eslint-env jest */

import { activePromptNetwork, activeOriginNetwork, restOfNetwork } from '../network';

describe('network selector', () => {
  const activeStageAttributes = {
    type: 'person',
  };

  const activePromptAttributes = {
    foo_bar: true,
  };

  const activeOriginAttributes = {
    stageId: 'foo',
    promptId: 'baz',
  };

  const mockActiveOriginNetwork = {
    nodes: [
      { uid: 1, stageId: 'foo', promptId: 'baz', type: 'person', foo_bar: true },
      { uid: 2, stageId: 'foo', promptId: 'baz', type: 'person', foo_bar: true },
    ],
  };

  const network = {
    nodes: [
      { uid: 1, stageId: 'foo', promptId: 'baz', type: 'person', foo_bar: true },
      { uid: 2, stageId: 'foo', promptId: 'baz', type: 'person', foo_bar: true },
      { uid: 3, stageId: 'bar', promptId: 'buzz', type: 'person', foo_bar: true },
      { uid: 4, stageId: 'bar', promptId: 'buzz', type: 'object', foo_bar: true },
      { uid: 5, stageId: 'bar', promptId: 'buzz', type: 'person' },
      { uid: 6, stageId: 'foo', promptId: 'fizz', type: 'person', foo_bar: true },
    ],
  };

  it('activePromptNetwork returns the network filtered by activeNodeAttributes', () => {
    const result = activePromptNetwork.resultFunc(
      network,
      activeStageAttributes,
      activePromptAttributes,
    );

    expect(result).toEqual({
      nodes: [
        { uid: 1, stageId: 'foo', promptId: 'baz', type: 'person', foo_bar: true },
        { uid: 2, stageId: 'foo', promptId: 'baz', type: 'person', foo_bar: true },
        { uid: 3, stageId: 'bar', promptId: 'buzz', type: 'person', foo_bar: true },
        { uid: 6, stageId: 'foo', promptId: 'fizz', type: 'person', foo_bar: true },
      ],
    });
  });

  it('activeOriginNetwork returns the network filtered by activeNodeAttributes', () => {
    expect(activeOriginNetwork.resultFunc(network, activeOriginAttributes)).toEqual({
      nodes: [
        { uid: 1, stageId: 'foo', promptId: 'baz', type: 'person', foo_bar: true },
        { uid: 2, stageId: 'foo', promptId: 'baz', type: 'person', foo_bar: true },
      ],
    });
  });

  it('restOfNetwork returns the network excluding those matching stage attribute and of other node types', () => {
    const result = restOfNetwork.resultFunc(
      network,
      mockActiveOriginNetwork,
      activeStageAttributes,
    );

    expect(result).toEqual({
      nodes: [
        { uid: 3, stageId: 'bar', promptId: 'buzz', type: 'person', foo_bar: true },
        { uid: 5, stageId: 'bar', promptId: 'buzz', type: 'person' },
        { uid: 6, stageId: 'foo', promptId: 'fizz', type: 'person', foo_bar: true },
      ],
    });
  });
});
