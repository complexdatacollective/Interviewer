import { get } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { getPromptIndexForCurrentSession } from '../selectors/session';

const usePrompts = ({ stage, promptId }) => {
  const prompts = get(stage, 'prompts', []);

  const getPromptIndex = useSelector(getPromptIndexForCurrentSession);

  const promptIndex = useMemo(() => {
    if (promptId) { return promptId; }

    return getPromptIndex;
  }, [promptId, getPromptIndex, stage]);

  const dispatch = useDispatch();
  const updatePromptIndex = (index) => dispatch(sessionsActions.updatePrompt(index));

  const prompt = useCallback(get(prompts, promptIndex), [prompts, promptIndex]);
  const isFirstPrompt = useCallback(promptIndex === 0, [promptIndex]);
  const isLastPrompt = useCallback(promptIndex === prompts.length - 1, [promptIndex, prompts]);

  const nextPrompt = useCallback(() => {
    updatePromptIndex((prompts.length + promptIndex + 1) % prompts.length);
  }, [prompts, promptIndex, updatePromptIndex]);

  const previousPrompt = useCallback(() => {
    updatePromptIndex((prompts.length + promptIndex - 1) % prompts.length);
  }, [prompts, promptIndex, updatePromptIndex]);

  return {
    prompt,
    isFirstPrompt,
    isLastPrompt,
    nextPrompt,
    previousPrompt,
  };
};

export default usePrompts;
