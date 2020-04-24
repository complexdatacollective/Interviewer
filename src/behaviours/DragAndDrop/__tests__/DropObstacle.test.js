/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { mount } from 'enzyme';
import { actionCreators as actions } from '../reducer';
import DropObstacle from '../DropObstacle';

jest.mock('../store');
jest.mock('../reducer');
jest.useFakeTimers();

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
      jest.runTimersToTime(1000);
      expect(actions.upsertObstacle.mock.calls.length).toEqual(10); // 10 fps
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
