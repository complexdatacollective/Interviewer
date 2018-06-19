import { orderBy } from 'lodash';

const withCreatedIndex = items => items.map((item, createdIndex) => ({ ...item, createdIndex }));
const fifo = ({ createdIndex }) => createdIndex;

// TODO: Use variable registry to respect variable type?
// eslint-disable-next-line
const sortOrder = (sortConfiguration, variableRegistry = {}) => {
  const iteratees = sortConfiguration.map(rule => rule.property)
    .map(property => (property === '*' ? fifo : property));

  const orders = sortConfiguration.map(rule => rule.direction);

  return items =>
    orderBy(
      withCreatedIndex(items),
      iteratees,
      orders,
    );
};

export default sortOrder;
