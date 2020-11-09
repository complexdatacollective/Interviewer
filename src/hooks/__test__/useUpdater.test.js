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

  it.todo('shows a toast when an update is available');

  it.todo('does not show a toast when an update has been dismissed');

  it.todo('fails silently');

  it.todo('handles networking errors');

  it.todo('can use a timeout to delay');
});
