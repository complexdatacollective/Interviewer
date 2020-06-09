/* eslint-env jest */
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { makeTestingApp, stopApp } from './__tests__/helpers';

beforeAll(async () => {
  jest.setTimeout(60000);

  expect.extend({ toMatchImageSnapshot });

  await makeTestingApp('Network-Canvas');
});

afterAll(async () => {
  await stopApp();
});
