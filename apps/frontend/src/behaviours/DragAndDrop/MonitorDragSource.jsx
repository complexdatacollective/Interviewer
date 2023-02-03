import Monitor from './Monitor';

const defaultMonitorProps = {
  isDragging: false,
  meta: {},
};

const getMonitorProps = (state) => {
  const { source } = state;

  if (!source) { return { ...defaultMonitorProps }; }

  const monitorProps = {
    isDragging: true,
    meta: { ...source.meta },
  };

  return monitorProps;
};

const MonitorDragSource = (types) => Monitor(getMonitorProps, types);

export default MonitorDragSource;
