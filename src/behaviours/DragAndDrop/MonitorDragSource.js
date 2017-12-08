import { isEmpty } from 'lodash';
import Monitor from './Monitor';

const defaultMonitorProps = {
  isDragging: false,
  isOver: false,
  canAccept: false,
  meta: {},
};

const getMonitorProps = (state, props) => {
  const source = state.source;
  const monitorProps = {
    isOver: source.isOver,
    isDragging: isEmpty(source),
    meta: { ...source.meta },
    canAccept: false, // TODO: Add this to reducer
  }
  return monitorProps;
};

const MonitorDropTarget = types =>
  Monitor(getMonitorProps, types);

export default MonitorDropTarget;

