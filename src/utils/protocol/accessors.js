import { has } from 'lodash';

// eslint-disable-next-line import/prefer-default-export
export const getSubject = (stage, prompt) => {
  if (has(stage, 'subject')) { return stage.subject; }
  return prompt.subject;
};
