import { filter, differenceBy } from 'lodash';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';

const nodeIncludesAttributes = (network, attributes) => {
  const nodes = filter(network.nodes, attributes);

  return {
    ...network, // TODO: filter edge etc.
    nodes,
  };
};

const difference = (source, target) => {
  const nodes = differenceBy(source.nodes, target.nodes, entityPrimaryKeyProperty);

  return {
    ...source, // TODO: filter edge etc.
    nodes,
  };
};

// TODO: combine edge etc.
const join = (networkA, networkB) => ({
  ...networkA,
  edges: [...networkA.edges, ...networkB.edges],
  nodes: [...networkA.nodes, ...networkB.nodes],
});

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
