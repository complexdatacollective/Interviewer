import { withHandlers } from 'recompose';
import { uniqueId, has } from 'lodash';

const dropId = (prefix = '') =>
  withHandlers(
    (props) => {
      if (has(props, 'id')) { return props; }
      return { id: uniqueId(prefix) };
    },
  );

export default dropId;
