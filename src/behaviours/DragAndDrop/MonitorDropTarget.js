
import { find } from 'lodash';
import Monitor from './Monitor';

const defaultMonitorProps = {
  isOver: false,
  canAccept: false,
};

const getMonitorProps = (state, props) => {
  console.log('getMonitorProps', state, props);
  const target = find(state.targets, ['id', props.id]);
  if (!target) { return { ...defaultMonitorProps } };
  const monitorProps = {
    isOver: (target.isOver || false),
    canAccept: target.accepts.indexOf(state.source.itemType) !== -1,
  }
  return monitorProps;
};

const MonitorDropTarget = types =>
  Monitor(getMonitorProps, types);

export default MonitorDropTarget;
