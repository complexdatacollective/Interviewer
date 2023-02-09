/* eslint-env jest */
const { getGraphMLTypeForKey } = require('../helpers');

describe('getGraphMLTypeForKey', () => {
  it('defaults to empty', () => {
    expect(getGraphMLTypeForKey([])).toEqual('');
  });

  it('returns empty for null values', () => {
    const node = { attributes: { name: null } };
    expect(getGraphMLTypeForKey([node], 'name')).toEqual('');
  });

  it('identifies a string', () => {
    const node = { attributes: { name: 'Alice' } };
    expect(getGraphMLTypeForKey([node], 'name')).toEqual('string');
  });

  it('identifies an int', () => {
    const node = { attributes: { age: 23 } };
    expect(getGraphMLTypeForKey([node], 'age')).toEqual('int');
  });

  it('identifies an int from strings', () => {
    const node = { attributes: { age: '23' } };
    expect(getGraphMLTypeForKey([node], 'age')).toEqual('int');
  });

  it('identifies a double', () => {
    const node = { attributes: { avg: 1.5 } };
    expect(getGraphMLTypeForKey([node], 'avg')).toEqual('double');
  });

  it('identifies a double from strings', () => {
    const node = { attributes: { avg: '1.5' } };
    expect(getGraphMLTypeForKey([node], 'avg')).toEqual('double');
  });

  it('identifies a boolean', () => {
    const node = { attributes: { isSet: true } };
    expect(getGraphMLTypeForKey([node], 'isSet')).toEqual('boolean');
  });

  it('favors later (non-null) values when types conflict', () => {
    const nodeA = { attributes: { a: true } };
    const nodeB = { attributes: { a: 'foo' } };
    const nodeC = { attributes: { a: null } };
    expect(getGraphMLTypeForKey([nodeA, nodeB, nodeC], 'a')).toEqual('string');
  });

  it('favors double over int when mixed', () => {
    const nodeA = { attributes: { a: 1 } };
    const nodeB = { attributes: { a: 2.1 } };
    expect(getGraphMLTypeForKey([nodeA, nodeB], 'a')).toEqual('double');
  });

  it('favors double over int when mixed (int last)', () => {
    const nodeA = { attributes: { a: 1.1 } };
    const nodeB = { attributes: { a: 2 } };
    expect(getGraphMLTypeForKey([nodeA, nodeB], 'a')).toEqual('double');
  });

  it('favors double over int when mixed strings', () => {
    const nodeA = { attributes: { a: '1' } };
    const nodeB = { attributes: { a: '2.1' } };
    expect(getGraphMLTypeForKey([nodeA, nodeB], 'a')).toEqual('double');
  });

  it('favors double over int when mixed strings (int last)', () => {
    const nodeA = { attributes: { a: '1.1' } };
    const nodeB = { attributes: { a: '2' } };
    expect(getGraphMLTypeForKey([nodeA, nodeB], 'a')).toEqual('double');
  });

  it('defaults to a string in some cases?', () => {
    // TODO: review; this was the original implementation, but seems unexpected
    const nodeA = { attributes: { a: 2 } };
    const nodeB = { attributes: { a: false } };
    expect(getGraphMLTypeForKey([nodeA, nodeB], 'a')).toEqual('string');
  });

  it('defaults to a double in some cases?', () => {
    // TODO: review; this was the original implementation, but seems unexpected
    const nodeA = { attributes: { a: 'name' } };
    const nodeB = { attributes: { a: 2 } };
    expect(getGraphMLTypeForKey([nodeA, nodeB], 'a')).toEqual('double');
  });
});
