export const getCSSVariableAsString = (variableName) => {
  const style = getComputedStyle(document.body);
  return style.getPropertyValue(variableName).trim();
};

export const getCSSVariableAsNumber = (variableName) => {
  const style = getComputedStyle(document.body);
  return parseInt(style.getPropertyValue(variableName).trim(), 10);
};

export const getCSSVariableAsObject = (variableName) => {
  const style = getComputedStyle(document.body);
  return JSON.parse(style.getPropertyValue(variableName).trim());
};
