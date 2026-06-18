import { get } from '../../utils/lodash-replacements';

export const getTwoModeLayoutVariable = (twoMode, nodeType, layout) => {
  if (!twoMode) {
    return layout;
  }

  return get(layout, nodeType, null);
};
