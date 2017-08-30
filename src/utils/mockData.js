/* eslint-disable import/prefer-default-export */

import { shuffle, range } from 'lodash';
import { store } from '../ducks/store';
import { actionCreators as networkActions } from '../ducks/modules/network';

const nodes = [
  {
    type: 'person',
    name: 'Anita',
    nickname: 'Annie',
  },
  {
    type: 'person',
    name: 'Barry',
    nickname: 'Baz',
  },
  {
    type: 'person',
    name: 'Carlito',
    nickname: 'Carl',
  },
  {
    type: 'person',
    name: 'Dee',
    nickname: 'Dee',
  },
  {
    type: 'person',
    name: 'Eugine',
    nickname: 'Eu',
  },
  {
    type: 'person',
    name: 'Fiona',
    nickname: 'Fi',
  },
  {
    type: 'person',
    name: 'Geoff',
    nickname: 'Geoff',
  },
  {
    type: 'person',
    name: 'Harmony',
    nickname: 'Harmony',
  },
];

export const populateNodes = (howMany = 0) => {
  const pseudoRandom = shuffle(range(0, nodes.length - 1));

  const randomNodes = pseudoRandom.splice(0, howMany < nodes.length ? howMany : nodes.length - 1);

  return randomNodes.map((key) => {
    const node = nodes[key];

    store.dispatch(networkActions.addNode(node));

    return node;
  });
};
