import { get } from 'lodash';

const mockCSSVariables = {
  '--ring': '#995522',
  '--background': '#227733',
};

const getCSSVariable = cssVariableName =>
  get(mockCSSVariables, cssVariableName);

export default getCSSVariable;
