import Monitor from './Monitor';

const defaultMonitorProps = {
  isDragging: false,
  isOver: false,
  canAccept: false,
};

const getMonitorProps = (state, props) => ({
  ...defaultMonitorProps,
});

const MonitorDropTarget = types =>
  Monitor(getMonitorProps, types);

export default MonitorDropTarget;

