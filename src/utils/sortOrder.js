import { orderBy } from 'lodash';

const fifo = (node, index) => index;

// TODO: Use variable registry to respect variable type?
const sortOrder = (sortConfiguration, variableRegistry) => {
  const iteratees = sortConfiguration.map(rule => rule.property)
    .map(property => (property === '*' ? fifo : property));

  const orders = sortConfiguration.map(rule => rule.direction);

  return items =>
    orderBy(items, iteratees, orders);
};

export default sortOrder;
