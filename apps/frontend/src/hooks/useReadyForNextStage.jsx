import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators as uiActions } from '../ducks/modules/ui';
import { get } from '../utils/lodash-replacements';

const useReadyForNextStage = () => {
  const dispatch = useDispatch();

  const updateReady = useCallback((isReady) => {
    dispatch(uiActions.update({ FORM_IS_READY: isReady }));
  }, [dispatch]);

  const isReady = useSelector((state) => get(state, ['ui', 'FORM_IS_READY'], false));

  useEffect(() => {
    updateReady(false);

    return () => updateReady(false);
  }, [updateReady]);

  return [isReady, updateReady];
};

export default useReadyForNextStage;
