/* eslint-env jest */
import reducer from '../externalData';
import { nodePrimaryKeyProperty } from '../network';

const initialState = null;

const actionWithData = externalData => ({
  type: 'SET_PROTOCOL',
  protocol: {
    externalData,
  },
});

describe('the externalData reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('sets the state after protocol import', () => {
    const data = { students: { nodes: [] } };
    const newState = reducer(initialState, actionWithData(data));
    expect(newState).toEqual(data);
  });

  it('assigns a UID to new data', () => {
    const data = { students: { nodes: [{ name: 'a' }] } };
    const newState = reducer(initialState, actionWithData(data));
    expect(newState.students.nodes[0])
      .toMatchObject({ [nodePrimaryKeyProperty]: expect.any(String) });
  });

  it('uses consistent hashing for IDs', () => {
    const data = { students: { nodes: [{ name: 'a' }, { name: 'a' }] } };
    const newState = reducer(initialState, actionWithData(data));
    expect(newState.students.nodes[0][nodePrimaryKeyProperty]).toBeDefined();
    expect(newState.students.nodes[0]).toEqual(newState.students.nodes[1]);
  });
});
