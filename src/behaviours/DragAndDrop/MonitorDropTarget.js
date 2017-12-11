
import { find, get } from 'lodash';
import Monitor from './Monitor';

const defaultMonitorProps = {
  isOver: false,
  willAccept: false,
};

const getMonitorProps = (state, props) => {
  const target = find(state.targets, ['id', props.id]);

  if (!target) { return { ...defaultMonitorProps } };

  const monitorProps = {
    isOver: get(target, 'isOver', false),
    willAccept: get(target, 'willAccept', false),
  }

  return monitorProps;
};

const MonitorDropTarget = types =>
  Monitor(getMonitorProps, types);

export default MonitorDropTarget;
