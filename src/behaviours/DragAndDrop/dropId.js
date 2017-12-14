import { withPropsOnChange } from 'recompose';
import { uniqueId, has } from 'lodash';

const dropId = (prefix = '') =>
  withPropsOnChange(
    'id',
    (props) => {
      if (has(props, 'id')) { return props; }
      return { ...props, id: uniqueId(prefix) };
    },
  );

export default dropId;
