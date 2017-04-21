import _ from 'lodash';

const nodeIncludesAttributes = (network, attributes) => {
  const nodes = _.filter(network.nodes, attributes);

  return {
    nodes
  }
}

const diff = (source, target) => {
  const nodes = _.reject(source.nodes, (nodeA) => {
    return _.findIndex(target.nodes, (nodeB) => { return _.isEqual(nodeA, nodeB); }) !== -1;
  });

  return {
    nodes
  }
}

export {
  nodeIncludesAttributes,
  diff,
};

export default {
  nodeIncludesAttributes,
  diff,
};
