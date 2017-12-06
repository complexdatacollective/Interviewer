import { mapProps } from 'recompose';
import { uniqueId, has } from 'lodash/fp';

const hasId = has('id');

const dropId = (prefix = '') =>
  mapProps((props) => {
    if (hasId(props)) { return props; }
    return { ...props, id: uniqueId(prefix) };
  });

export default dropId;
