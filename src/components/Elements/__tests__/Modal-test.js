/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import Modal from '../../Elements/Modal';

const modalName = 'foo';

const closedState = {
  modals: [
    {
      open: false,
      name: modalName,
    },
  ],
};

const openState = {
  modals: [
    {
      open: true,
      name: modalName,
    },
  ],
};

describe('Modal component', () => {
  describe('show is false', () => {
    it('renders nothing', () => {
      const component = mount((
        <Provider store={createStore(() => closedState)}>
          <Modal title="foo" name={modalName}>
            foo
          </Modal>
        </Provider>
      ));

      expect(component.find('.modal').length).toBe(0);
    });
  });

  describe('show is true', () => {
    it('renders with content', () => {
      const component = mount((
        <Provider store={createStore(() => openState)}>
          <Modal title="foo" name={modalName}>
            <span>foo</span>
          </Modal>
        </Provider>
      ));

      expect(component.contains(<span>foo</span>)).toBe(true);
    });

    it('calls close when close button is clicked', () => {
      const close = jest.fn();
      const component = mount((
        <Provider store={createStore(() => openState)}>
          <Modal title="foo" name={modalName} close={close} />
        </Provider>
      ));

      expect(close.mock.calls.length).toBe(0);

      // Click on close button
      component.find('button').simulate('click');
      expect(close.mock.calls.length).toBe(1);

      // Click on background
      component.find('.modal').simulate('click');
      expect(close.mock.calls.length).toBe(2);

      // Clicks to window shouldn't trigger it
      component.find('.modal__window').simulate('click');
      expect(close.mock.calls.length).toBe(2);
    });
  });
});
