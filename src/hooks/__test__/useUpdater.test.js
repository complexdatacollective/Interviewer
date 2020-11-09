/* eslint-env jest */
import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { checkEndpoint } from '../useUpdater';

jest.useFakeTimers();

const mockJson = jest.fn(() => ({
  name: '1.0.0',
  body: 'This is a newer version probably',
  assets: ['foo.exe'], // eslint-disable-line
}));


describe('checkEndpoint()', () => {
  let originalFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn(() => Promise.resolve({ json: mockJson }));
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('when app is the latest version', async () => {
    const subject = await checkEndpoint('foo', '1.0.0');
    expect(subject).toBe(false);
  });

  it('when app is a later version than the released version!', async () => {
    const subject = await checkEndpoint('foo', '2.0.0');
    expect(subject).toBe(false);
  });

  it('when there is an update available', async () => {
    const subject = await checkEndpoint('foo', '0.5.0');
    expect(subject).toEqual({
      newVersion: '1.0.0',
      releaseNotes: 'This is a newer version probably',
      releaseAssets: ['foo.exe'], // eslint-disable-line
    });
  });

  it('fails silently', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('bad url')));

    const subject = await checkEndpoint('foo', '0.5.0');

    expect(subject).toEqual(false);
  });
});
