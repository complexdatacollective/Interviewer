/* eslint-env jest */

jest.mock('electron');
jest.mock('fs');
jest.mock('redux-logger');
jest.mock('../../src/utils/Environment');
jest.mock('../../src/utils/uuid');
// jest.mock('../../src/ui/utils/CSSVariables');

global.console.error = jest.fn();
