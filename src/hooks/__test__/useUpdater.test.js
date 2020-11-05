/* eslint-env jest */
import React from 'react';
import useUpdater from '../useUpdater';

describe('useUpdater', () => {
  beforeAll(() => jest.spyOn(global, 'fetch'));

  it('requests release data from endpoint', () => {
    const updater = useUpdater('https://test.com');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('shows a toast when an update is available', () => {

  });

  it('does not show a toast when an update has been dismissed', () => {

  });

  it('fails silently', () => {
    fetch.mockImplementationOnce(() => Promise.reject('API is down'));
  });

  it('handles networking errors', () => {

  });

  it('can use a timeout to delay', () => {

  });
});
