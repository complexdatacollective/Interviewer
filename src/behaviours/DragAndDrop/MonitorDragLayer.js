import mergeMapPropsStream from './mergeMapPropsStream';
import Monitor from './Monitor';

const getMonitorProps = (state, props) => ({
  isDragging: false,
});

const MonitorDropTarget = types =>
  Monitor(getMonitorProps, types);

export default MonitorDropTarget;

