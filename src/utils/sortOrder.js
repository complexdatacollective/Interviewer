import { orderBy } from 'lodash';

// TODO: Use variable registry to respect variable type?
const sortOrder = (sortConfiguration, variableRegistry) => {
  const iteratees = sortConfiguration.map(item => item.variable);
  const orders = sortConfiguration.map(item => item.direction);

  return items =>
    orderBy(items, iteratees, orders);
};

export default sortOrder;
