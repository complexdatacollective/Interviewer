import { useEffect, useState, useRef } from 'react';
import {
  find,
  get,
  pick,
  isEqual,
} from 'lodash';

import store from './store';

const defaultProps = ['isOver', 'willAccept'];

const getMonitorProps = (state, id, props) => {
  const target = find(state.targets, ['id', id]);

  if (!target) { return null; }

  const monitorProps = {
    isOver: get(target, 'isOver', false),
    willAccept: get(target, 'willAccept', false),
  };

  return pick(monitorProps, props);
};

const useDropMonitor = (id, props = defaultProps) => {
  const internalState = useRef();
  const [state, setState] = useState();

  const updateState = (newState) => {
    if (isEqual(internalState.current, newState)) { return; }
    internalState.current = newState;
    setState(newState);
  };

  const updateMonitorProps = () => {
    const status = getMonitorProps(store.getState(), id, props);
    updateState(status);
  };

  useEffect(() => {
    const unsubscribe = store.subscribe(updateMonitorProps);

    return unsubscribe;
  }, []);

  return state;
};

export default useDropMonitor;
