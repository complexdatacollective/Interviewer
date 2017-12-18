/* eslint-env jest */

import React from 'react';
import { mount } from 'enzyme';
import { actionCreators as actions } from '../reducer';
import DropTarget from '../DropTarget';

jest.mock('../store');
jest.mock('../reducer');
jest.useFakeTimers();

const mockProps = {
  id: 'foo',
};

describe('DropTarget', () => {
  describe('on mount', () => {
    let component;

    beforeEach(() => {
      actions.updateTarget.mockClear();
      const MockComponent = DropTarget('div');

      component = mount((
        <MockComponent {...mockProps} />
      ));
    });

    afterEach(() => {
      component.unmount();
    });

    it('registers target with UPDATE_TARGET on mount', () => {
      expect(actions.updateTarget.mock.calls.length).toEqual(1);
    });
  });

  describe('on interal', () => {
    let component;

    beforeEach(() => {
      actions.updateTarget.mockClear();
      const MockComponent = DropTarget('div');

      component = mount((
        <MockComponent {...mockProps} />
      ));
    });

    afterEach(() => {
      component.unmount();
    });

    it('updates target with UPDATE_TARGET on interval', () => {
      jest.runTimersToTime(1000);
      expect(actions.updateTarget.mock.calls.length).toEqual(10); // 10 fps
    });
  });

  describe('on unmount', () => {
    beforeEach(() => {
      actions.removeTarget.mockClear();
      const MockComponent = DropTarget('div');

      mount((
        <MockComponent {...mockProps} />
      )).unmount();
    });

    it('deregisters target with REMOVE_TARGET on unmount', () => {
      expect(actions.removeTarget.mock.calls.length).toEqual(1);
    });
  });
});
