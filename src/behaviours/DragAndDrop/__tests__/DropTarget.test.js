/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import React from 'react';
import { mount } from 'enzyme';
import { actionCreators as actions } from '../reducer';
import DropTarget from '../DropTarget';

vi.mock('../store');
vi.mock('../reducer');
vi.useFakeTimers();

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
      vi.advanceTimersByTime(1000);
      // 10 fps means calls at 100ms intervals. After 1000ms we expect multiple calls.
      expect(actions.upsertTarget.mock.calls.length).toBeGreaterThanOrEqual(9);
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
