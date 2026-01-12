/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import React from 'react';
import { mount } from 'enzyme';
import DragManager from '../DragManager';
// eslint-disable-next-line import/named
import DragPreview, { position as previewPosition, cleanup as previewCleanup } from '../DragPreview';
import { actionCreators as actions } from '../reducer';
import DragSource from '../DragSource';

vi.mock('../DragManager');
vi.mock('../DragPreview');
vi.mock('../store');
vi.mock('../reducer');

describe('DragSource', () => {
  describe('on drag start', () => {
    let component;

    beforeEach(() => {
      DragPreview.mockClear();
      actions.dragStart.mockClear();

      const MockComponent = DragSource('div');

      component = mount((
        <MockComponent />
      ));

      DragManager.getOptions().onDragStart({ x: 0, y: 0 });
    });

    afterEach(() => {
      component.unmount();
    });

    it('it creates a preview', () => {
      expect(DragPreview.mock.calls.length).toEqual(1);
    });

    it('registers source with DRAG_START', () => {
      expect(actions.dragStart.mock.calls.length).toEqual(1);
    });
  });

  describe('on drag move', () => {
    let component;

    beforeEach(() => {
      DragPreview.mockClear();
      actions.dragMove.mockClear();

      const MockComponent = DragSource('div');

      component = mount((
        <MockComponent />
      ));

      DragManager.getOptions().onDragStart({ x: 0, y: 0 });
      DragManager.getOptions().onDragMove({ x: 0, y: 0 });
    });

    afterEach(() => {
      component.unmount();
    });

    it('updates the preview', () => {
      expect(previewPosition.mock.calls.length).toEqual(1);
    });

    it('updates source with DRAG_MOVE', () => {
      expect(actions.dragMove.mock.calls.length).toEqual(1);
    });
  });

  describe('on drag end', () => {
    let component;

    beforeEach(() => {
      previewCleanup.mockClear();
      actions.dragEnd.mockClear();

      const MockComponent = DragSource('div');

      component = mount((
        <MockComponent />
      ));

      DragManager.getOptions().onDragStart({ x: 0, y: 0 });
      DragManager.getOptions().onDragEnd({ x: 0, y: 0 });
    });

    afterEach(() => {
      component.unmount();
    });

    it('it removes the preview', () => {
      expect(previewCleanup.mock.calls.length).toEqual(1);
    });

    it('removes source with DRAG_END', () => {
      expect(actions.dragEnd.mock.calls.length).toEqual(1);
    });
  });

  describe('on unmount', () => {
    let component;

    beforeEach(() => {
      previewCleanup.mockClear();
      DragManager.unmount.mockClear();

      const MockComponent = DragSource('div');

      component = mount((
        <MockComponent />
      ));

      DragManager.getOptions().onDragStart({ x: 0, y: 0 });

      component.unmount();
    });

    it('it removes the preview', () => {
      expect(previewCleanup.mock.calls.length).toEqual(1);
    });

    it('removes source with DRAG_END', () => {
      expect(DragManager.unmount.mock.calls.length).toEqual(1);
    });
  });
});
