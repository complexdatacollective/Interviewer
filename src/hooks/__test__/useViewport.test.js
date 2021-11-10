/* eslint-disable @codaco/spellcheck/spell-checker */
/* eslint-env jest */

import React from 'react';
import { mount } from 'enzyme';
import useViewport from '../useViewport';

const TestConsumer = () => {
  const viewport = useViewport();

  return <div useViewport={viewport} />;
};

const viewportShape = {
  current: {
    zoom: expect.any(Number),
    center: {
      x: expect.any(Number),
      y: expect.any(Number),
    },
  },
};

describe('useViewport', () => {
  it('returns correct interface', () => {
    const subject = mount((
      <TestConsumer />
    ));

    const {
      viewport,
      moveViewport,
      zoomViewport,
      calculateLayoutCoords,
      calculateRelativeCoords,
    } = subject.find('div').prop('useViewport');

    expect(viewport).toMatchObject(viewportShape);
    expect(moveViewport).toBeInstanceOf(Function);
    expect(zoomViewport).toBeInstanceOf(Function);
    expect(calculateLayoutCoords).toBeInstanceOf(Function);
    expect(calculateRelativeCoords).toBeInstanceOf(Function);
  });

  describe('navigation', () => {
    it('correctly moves viewport', () => {
      const subject = mount((
        <TestConsumer />
      ));

      const {
        viewport,
        moveViewport,
        zoomViewport,
      } = subject.find('div').prop('useViewport');

      moveViewport(0.1, 0.1);
      zoomViewport(2);

      expect(viewport).toEqual({
        current: {
          zoom: 2,
          center: {
            x: 100,
            y: 100,
          },
        },
      });
    });
  });

  describe('calculateLayoutCoords()', () => {
    it('correctly calculates layout coords for default viewport', () => {
      const subject = mount((
        <TestConsumer />
      ));

      const {
        calculateLayoutCoords,
      } = subject.find('div').prop('useViewport');

      expect(calculateLayoutCoords({ x: 0, y: 0 }))
        .toEqual({ x: -500, y: -500 });
      expect(calculateLayoutCoords({ x: 0.5, y: 0 }))
        .toEqual({ x: 0, y: -500 });
      expect(calculateLayoutCoords({ x: 1, y: 0.5 }))
        .toEqual({ x: 500, y: 0 });
      expect(calculateLayoutCoords({ x: 1, y: 1 }))
        .toEqual({ x: 500, y: 500 });
    });

    it('correctly calculates layout coords for modified viewport', () => {
      const subject = mount((
        <TestConsumer />
      ));

      const {
        calculateLayoutCoords,
        moveViewport,
        zoomViewport,
      } = subject.find('div').prop('useViewport');

      moveViewport(0.1, 0.1); // center = 100, 100

      expect(calculateLayoutCoords({ x: 0, y: 0 }))
        .toEqual({ x: -400, y: -400 });
      expect(calculateLayoutCoords({ x: 0.5, y: 0.5 }))
        .toEqual({ x: 100, y: 100 });
      expect(calculateLayoutCoords({ x: 1, y: 1 }))
        .toEqual({ x: 600, y: 600 });

      moveViewport(0, 0, true); // center = 0, 0
      zoomViewport(2); // zoom = 2

      expect(calculateLayoutCoords({ x: 0, y: 0 }))
        .toEqual({ x: -250, y: -250 });
      expect(calculateLayoutCoords({ x: 0.5, y: 0.5 }))
        .toEqual({ x: 0, y: 0 });
      expect(calculateLayoutCoords({ x: 1, y: 1 }))
        .toEqual({ x: 250, y: 250 });
    });
  });

  describe('calculateRelativeCoords()', () => {
    it('correctly calculates relative coords for default viewport', () => {
      const subject = mount((
        <TestConsumer />
      ));

      const {
        calculateRelativeCoords,
      } = subject.find('div').prop('useViewport');

      expect(calculateRelativeCoords({ x: -500, y: -500 }))
        .toEqual({ x: 0, y: 0 });
      expect(calculateRelativeCoords({ x: 0, y: -500 }))
        .toEqual({ x: 0.5, y: 0 });
      expect(calculateRelativeCoords({ x: 500, y: 0 }))
        .toEqual({ x: 1, y: 0.5 });
      expect(calculateRelativeCoords({ x: 500, y: 500 }))
        .toEqual({ x: 1, y: 1 });
    });

    it('correctly calculates relative coords for moved viewport', () => {
      const subject = mount((
        <TestConsumer />
      ));

      const {
        calculateRelativeCoords,
        moveViewport,
      } = subject.find('div').prop('useViewport');

      moveViewport(0.1, 0.1, true); // center = 100, 100

      expect(calculateRelativeCoords({ x: -400, y: -400 }))
        .toEqual({ x: 0, y: 0 });
      expect(calculateRelativeCoords({ x: 100, y: 100 }))
        .toEqual({ x: 0.5, y: 0.5 });
      expect(calculateRelativeCoords({ x: 600, y: 600 }))
        .toEqual({ x: 1, y: 1 });
    });

    it('correctly calculates relative coords for zoomed viewport', () => {
      const subject = mount((
        <TestConsumer />
      ));

      const {
        calculateRelativeCoords,
        zoomViewport,
      } = subject.find('div').prop('useViewport');

      zoomViewport(2, true); // zoom = 2

      expect(calculateRelativeCoords({ x: -250, y: -250 }))
        .toEqual({ x: 0, y: 0 });
      expect(calculateRelativeCoords({ x: 0, y: 0 }))
        .toEqual({ x: 0.5, y: 0.5 });
      expect(calculateRelativeCoords({ x: 250, y: 250 }))
        .toEqual({ x: 1, y: 1 });
    });

    it('correctly calculates relative coords for moved and zoomed viewport', () => {
      const subject = mount((
        <TestConsumer />
      ));

      const {
        calculateRelativeCoords,
        moveViewport,
        zoomViewport,
      } = subject.find('div').prop('useViewport');

      moveViewport(0.1, 0.1, true); // center = 100, 100
      zoomViewport(2, true); // zoom = 2

      expect(calculateRelativeCoords({ x: -150, y: -150 }))
        .toEqual({ x: 0, y: 0 });
      expect(calculateRelativeCoords({ x: 100, y: 100 }))
        .toEqual({ x: 0.5, y: 0.5 });
      expect(calculateRelativeCoords({ x: 350, y: 350 }))
        .toEqual({ x: 1, y: 1 });
    });
  });
});
