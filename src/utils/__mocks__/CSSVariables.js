import { get } from 'lodash';

const mockCSSVariables = {
  '--ring': '#995522',
  '--background': '#227733',
  '--animation-scale-factor': 1,
  '--animation-duration-fast': `${(1 * 0.3)}s`,
  '--animation-duration-fast-ms': 1000 * 0.3,
  '--animation-duration-standard': `${(1 * 0.5)}s`,
  ' --animation-duration-standard-ms': 1000 * 0.5,
  '--animation-duration-slow': `${(1 * 1)}s`,
  '--animation-duration-slow-ms': 1000 * 1,
  '--animation-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
  '--animation-easing-js': '[0.4, 0, 0.2, 1]',
};

const getCSSVariable = cssVariableName =>
  get(mockCSSVariables, cssVariableName);

export default getCSSVariable;
