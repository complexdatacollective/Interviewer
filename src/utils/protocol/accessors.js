import { has } from 'lodash';

export const getSubject = (stage, prompt) => {
  if (has(stage, 'subject')) { return stage.subject; }
  return prompt.subject;
};

export const getAdditionalAttributes = (stage, prompt) => {
  const stageAttributes = (has(stage, 'additionalAttributes') ? stage.additionalAttributes : {});
  const promptAttributes = (has(prompt, 'additionalAttributes') ? prompt.additionalAttributes : {});

  return {
    ...stageAttributes,
    ...promptAttributes,
  };
};
