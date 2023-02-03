import { get } from "../lodash-replacements";

export const getSubject = (stage, prompt) => {
  return stage.subject || prompt.subject;
}

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
