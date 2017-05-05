/* eslint-env jest */

import { activePromptNetwork, restOfNetwork } from '../network';

describe('network selector', () => {

  const activeStageAttributes = {
    type: 'person',
    stageId: 'foo',
  }

  const activePromptAttributes = {
    foo_bar: true,
  };

  const activeNodeAttributes = {
    ...activePromptAttributes,
    ...activeStageAttributes
  };

  const network = {
    nodes: [
      { uid: 1, stageId: 'foo', type: 'person', foo_bar: true },
      { uid: 2, stageId: 'foo', type: 'person', foo_bar: true },
      { uid: 3, stageId: 'bar', type: 'person', foo_bar: true },
      { uid: 4, stageId: 'bar', type: 'object', foo_bar: true },
      { uid: 5, stageId: 'bar', type: 'person' },
    ]
  };

  it('activePromptNetwork returns the network filtered by activeNodeAttributes', () => {
    expect(activePromptNetwork.resultFunc(network, activeNodeAttributes)).toEqual({
      nodes: [
        { uid: 1, stageId: 'foo', type: 'person', foo_bar: true },
        { uid: 2, stageId: 'foo', type: 'person', foo_bar: true },
      ],
    });
  });

  it('restOfNetwork returns the network excluding those matching stage attribute and of other node types', () => {
    expect(restOfNetwork.resultFunc(network, activeStageAttributes)).toEqual({
      nodes: [
        { uid: 3, stageId: 'bar', type: 'person', foo_bar: true },
        { uid: 5, stageId: 'bar', type: 'person' },
      ],
    });
  });


});
