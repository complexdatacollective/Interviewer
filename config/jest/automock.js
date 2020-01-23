/* eslint-env jest */

jest.mock('electron');
jest.mock('fs');
jest.mock('redux-logger');
jest.mock('../../src/utils/Environment');
jest.mock('../../src/utils/uuid');

global.console.error = jest.fn();
