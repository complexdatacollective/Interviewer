/* eslint-env jest */

jest.mock('electron');
jest.mock('fs');
jest.mock('../../src/utils/Environment');

global.console.error = jest.fn();
