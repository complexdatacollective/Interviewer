/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import React from 'react';
import { mount } from 'enzyme';
import { actionCreators as actions } from '../reducer';
import DropObstacle from '../DropObstacle';

vi.mock('../store');
vi.mock('../reducer');
vi.useFakeTimers();

const mockProps = {
  id: 'foo',
};

describe('DropObstacle', () => {
  describe('on mount', () => {
    let component;

    beforeEach(() => {
      actions.upsertObstacle.mockClear();
      const MockComponent = DropObstacle('div');

      component = mount((
        <MockComponent {...mockProps} />
      ));
    });

    afterEach(() => {
      component.unmount();
    });

    it('registers obstacle with UPSERT_OBSTACLE on mount', () => {
      expect(actions.upsertObstacle.mock.calls.length).toEqual(1);
    });
  });

  describe('on interval', () => {
    let component;

    beforeEach(() => {
      actions.upsertObstacle.mockClear();
      const MockComponent = DropObstacle('div');

      component = mount((
        <MockComponent {...mockProps} />
      ));
    });

    afterEach(() => {
      component.unmount();
    });

    it('upserts obstacle with UPSERT_OBSTACLE on interval', () => {
      vi.advanceTimersByTime(1000);
      // 10 fps means calls at 100ms intervals. After 1000ms we expect multiple calls.
      expect(actions.upsertObstacle.mock.calls.length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('on unmount', () => {
    beforeEach(() => {
      actions.removeObstacle.mockClear();
      const MockComponent = DropObstacle('div');

      mount((
        <MockComponent {...mockProps} />
      )).unmount();
    });

    it('deregisters obstacle with REMOVE_OBSTACLE on unmount', () => {
      expect(actions.removeObstacle.mock.calls.length).toEqual(1);
    });
  });
});
