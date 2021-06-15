import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { actionCreators as uiActions } from '../ducks/modules/ui';

const useReadyForNextStage = () => {
  const dispatch = useDispatch();

  const updateReady = useCallback((isReady) => {
    dispatch(uiActions.update({ FORM_IS_READY: isReady }));
  }, [dispatch]);

  useEffect(() => {
    updateReady(false);

    return () => updateReady(false);
  }, [updateReady]);
  return updateReady;
};

export default useReadyForNextStage;
