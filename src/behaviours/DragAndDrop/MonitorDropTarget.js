
import { find } from 'lodash';
import Monitor from './Monitor';

const defaultMonitorProps = {
  isOver: false,
  acceptsType: false,
};

const getMonitorProps = (state, props) => {
  const target = find(state.targets, ['id', props.id]);

  if (!target) { return { ...defaultMonitorProps } };

  const acceptsType = target.accepts.includes(state.source.itemType);

  const monitorProps = {
    isOver: (target.isOver || false),
    acceptsType,
  }

  return monitorProps;
};

const MonitorDropTarget = types =>
  Monitor(getMonitorProps, types);

export default MonitorDropTarget;
