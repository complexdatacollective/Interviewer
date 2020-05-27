/* eslint-env jest */

jest.mock('electron');
jest.mock('fs');
jest.mock('redux-logger');
jest.mock('../../src/utils/Environment');
jest.mock('uuid');

global.console.error = jest.fn();
