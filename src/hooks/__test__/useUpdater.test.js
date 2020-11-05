/* eslint-env jest */
// import { mount } from 'enzyme';
// import React from 'react';
// import { Provider } from 'react-redux';
// import { createStore } from 'redux';
// import useUpdater from '../useUpdater';

// const MockComponent = () => {
//   useUpdater('https://test.com');
//   return null;
// };

describe('useUpdater', () => {
  beforeAll(() => jest.spyOn(window, 'fetch'));

  // let store;

  // beforeEach(() => {
  //   store = createStore(() => {});
  // });

  it('requests release data from endpoint', () => {
    // const updater = mount(<Provider store={store}><MockComponent /></Provider>);
    // expect(window.fetch).toHaveBeenCalledTimes(1);
  });

  it('shows a toast when an update is available', () => {

  });

  it('does not show a toast when an update has been dismissed', () => {

  });

  it('fails silently', () => {
    // fetch.mockImplementationOnce(() => Promise.reject('API is down'));
  });

  it('handles networking errors', () => {

  });

  it('can use a timeout to delay', () => {

  });
});
