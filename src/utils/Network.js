import { filter, differenceBy } from 'lodash';

const nodeIncludesAttributes = (network, attributes) => {
  const nodes = filter(network.nodes, attributes);

  return {
    ...network,  // TODO: filter edge etc.
    nodes
  }
}

const difference = (source, target) => {
  const nodes = differenceBy(source.nodes, target.nodes, 'id');

  return {
    ...source,  // TODO: filter edge etc.
    nodes
  }
}

const join = (networkA, networkB) => {
  return {
    ...networkA,  // TODO: combine edge etc.
    edges: [ ...networkA.edges, ...networkB.edges ],
    nodes: [ ...networkA.nodes, ...networkB.nodes ],
  }
}

export {
  nodeIncludesAttributes,
  difference,
  join,
};

export default {
  nodeIncludesAttributes,
  difference,
  join,
};
