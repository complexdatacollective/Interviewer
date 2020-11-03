import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators, selectors } from '../ducks/modules/dismissedUpdates';

const useUIState = (key, defaultValue) => {
  const value = useSelector(selectors.getProperty(key));
  const dispatch = useDispatch();

  const setValue = (newValue) => {
    dispatch(actionCreators.setProperty(key, newValue));
  };

  useEffect(() => {
    if (value === undefined && value !== defaultValue) {
      setValue(defaultValue);
    }
  }, [value, defaultValue]);

  return [value, setValue];
};

export default useUIState;
