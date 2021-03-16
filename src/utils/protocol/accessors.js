import { get } from 'lodash';
import { getStageForCurrentSession } from '../../selectors/session';
import { createDeepEqualSelector } from '../../selectors/utils';

export const getSubject = (stage, prompt) => {
  return stage.subject || prompt.subject;
}

export const getStageSubject = () => createDeepEqualSelector(
  getStageForCurrentSession,
  stage => stage.subject,
);

export const getStageSubjectType = () => createDeepEqualSelector(
  getStageSubject(),
  subject => subject.type,
);


const asKeyValue = (acc, { variable, value }) => ({
  ...acc,
  [variable]: value,
});

export const getAdditionalAttributes = (stage, prompt) => {
  const stageAttributes = get(stage, 'additionalAttributes', [])
    .reduce(asKeyValue, {});
  const promptAttributes = get(prompt, 'additionalAttributes', [])
    .reduce(asKeyValue, {});

  return {
    ...stageAttributes,
    ...promptAttributes,
  };
};
