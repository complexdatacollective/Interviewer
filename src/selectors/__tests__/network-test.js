/* eslint-env jest */

import { activeNetwork, existingNetwork } from '../network';

describe('network selector', () => {

  const activeStageAttributes = {
    type: 'person',
    stageId: 'foo',
  }

  const activeNodeAttributes = {
    foo_bar: true,
    ...activeStageAttributes
  };

  const network = {
    nodes: [
      { id: 1, stageId: 'foo', type: 'person', foo_bar: true },
      { id: 2, stageId: 'foo', type: 'person', foo_bar: true },
      { id: 3, stageId: 'bar', type: 'person', foo_bar: true },
      { id: 4, stageId: 'bar', type: 'object', foo_bar: true },
      { id: 5, stageId: 'bar', type: 'person' },
    ]
  };

  it('activeNetwork returns the network filtered by activeNodeAttributes', () => {
    expect(activeNetwork.resultFunc(network, activeNodeAttributes)).toEqual({
      nodes: [
        { id: 1, stageId: 'foo', type: 'person', foo_bar: true },
        { id: 2, stageId: 'foo', type: 'person', foo_bar: true },
      ],
    });
  });

  it('existingNetwork returns the network excluding those matching activeStageAttributes and of other node types', () => {
    expect(existingNetwork.resultFunc(network, activeStageAttributes)).toEqual({
      nodes: [
        { id: 3, stageId: 'bar', type: 'person', foo_bar: true },
        { id: 5, stageId: 'bar', type: 'person' },
      ],
    });
  });


});
