/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

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
      actions.upsertTarget.mockClear();
      const MockComponent = DropTarget('div');

      component = mount((
        <MockComponent {...mockProps} />
      ));
    });

    afterEach(() => {
      component.unmount();
    });

    it('registers target with UPSERT_TARGET on mount', () => {
      expect(actions.upsertTarget.mock.calls.length).toEqual(1);
    });
  });

  describe('on interval', () => {
    let component;

    beforeEach(() => {
      actions.upsertTarget.mockClear();
      const MockComponent = DropTarget('div');

      component = mount((
        <MockComponent {...mockProps} />
      ));
    });

    afterEach(() => {
      component.unmount();
    });

    it('upserts target with UPSERT_TARGET on interval', () => {
      jest.runTimersToTime(1000);
      expect(actions.upsertTarget.mock.calls.length).toEqual(10); // 10 fps
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
