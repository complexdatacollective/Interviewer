/* eslint-env jest */

import React from 'react';
import { mount } from 'enzyme';
import DragManager from '../DragManager';
import DragPreview, { position as previewPosition, cleanup as previewCleanup } from '../DragPreview';
import { actionCreators as actions } from '../reducer';
import DragSource from '../DragSource';

jest.mock('../DragManager');
jest.mock('../DragPreview');
jest.mock('../store');
jest.mock('../reducer');

describe('DragSource', () => {
  describe('on drag start', () => {
    const startDrag = () => {
      DragPreview.mockClear();
      actions.dragStart.mockClear();

      const MockComponent = DragSource('div');

      mount((
        <MockComponent />
      ));

      DragManager.getOptions().onDragStart({ x: 0, y: 0 });
    };

    it('it creates a preview', () => {
      startDrag();

      expect(DragPreview.mock.calls.length).toEqual(1);
    });

    it('registers source with DRAG_START', () => {
      startDrag();

      expect(actions.dragStart.mock.calls.length).toEqual(1);
    });
  });

  describe('on drag move', () => {
    const dragMove = () => {
      DragPreview.mockClear();
      actions.dragMove.mockClear();

      const MockComponent = DragSource('div');

      mount((
        <MockComponent />
      ));

      DragManager.getOptions().onDragStart({ x: 0, y: 0 });
      DragManager.getOptions().onDragMove({ x: 0, y: 0 });
    };

    it('updates the preview', () => {
      dragMove();

      expect(previewPosition.mock.calls.length).toEqual(1);
    });

    it('updates source with DRAG_MOVE', () => {
      dragMove();

      expect(actions.dragMove.mock.calls.length).toEqual(1);
    });
  });

  describe('on drag end', () => {
    const dragEnd = () => {
      DragPreview.mockClear();
      actions.dragEnd.mockClear();

      const MockComponent = DragSource('div');

      mount((
        <MockComponent />
      ));

      DragManager.getOptions().onDragStart({ x: 0, y: 0 });
      DragManager.getOptions().onDragEnd({ x: 0, y: 0 });
    };

    it('it removes the preview', () => {
      dragEnd();

      expect(previewCleanup.mock.calls.length).toEqual(1);
    });

    it('removes source with DRAG_END', () => {
      dragEnd();

      expect(actions.dragEnd.mock.calls.length).toEqual(1);
    });
  });

  describe('on unmount', () => {
    const onUnmount = () => {
      previewCleanup.mockClear();
      DragPreview.mockClear();

      const MockComponent = DragSource('div');

      mount((
        <MockComponent />
      )).unmount();
    };

    it('it removes the preview', () => {
      onUnmount();

      expect(previewCleanup.mock.calls.length).toEqual(1);
    });

    it('removes source with DRAG_END', () => {
      onUnmount();

      expect(DragManager.unmount.mock.calls.length).toEqual(1);
    });
  });
});
