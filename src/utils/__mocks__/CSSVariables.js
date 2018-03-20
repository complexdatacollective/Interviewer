// import { get } from 'lodash';

// const mockCSSVariables = {
//   '--ring': '#995522',
//   '--background': '#227733',
// };

// const getCSSVariable = cssVariableName =>
//   get(mockCSSVariables, cssVariableName);

const getCSSVariable = (variableName) => {
  const style = getComputedStyle(document.body);
  return style.getPropertyValue(variableName).trim();
};

export default getCSSVariable;
