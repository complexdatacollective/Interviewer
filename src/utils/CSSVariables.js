const getCSSVariable = (variableName) => {
  const style = getComputedStyle(document.body);
  return style.getPropertyValue(variableName).trim();
};

export default getCSSVariable;
