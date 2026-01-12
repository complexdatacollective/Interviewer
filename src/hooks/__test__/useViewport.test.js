/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { mount } from 'enzyme';
import { useSpring, useMotionValue } from 'framer-motion';
import useViewport from '../useViewport';

vi.mock('framer-motion');

expect.extend({
  toMatchCoords(received, coords) {
    const passX = received.x.toFixed(3) === coords.x.toFixed(3);
    const passY = received.y.toFixed(3) === coords.y.toFixed(3);
    if (passX && passY) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to match ${JSON.stringify(coords)}`,
        pass: true,
      };
    }

    return {
      message: () => `expected ${JSON.stringify(received)} to match ${JSON.stringify(coords)}`,
      pass: false,
    };
  },
});

const TestConsumer = () => {
  const viewport = useViewport();

  return <div useViewport={viewport} />;
};

const viewportShape = {
  zoom: { get: expect.any(Function), set: expect.any(Function) },
  layoutSpace: 1000,
  center: {
    x: { get: expect.any(Function), set: expect.any(Function) },
    y: { get: expect.any(Function), set: expect.any(Function) },
  },
};

const createMotionValue = (initialValue) => {
  const state = {
    value: initialValue,
  };

  return {
    get: () => state.value,
    set: (newValue) => { state.value = newValue; },
  };
};

describe('useViewport', () => {
  beforeAll(() => {
    useMotionValue.mockImplementation(createMotionValue);
    useSpring.mockImplementation(createMotionValue);
  });

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

    expect(viewport).toEqual(viewportShape);
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

      moveViewport(0, 0, true);
      zoomViewport(1, true);

      moveViewport(0.1, 0.1);
      zoomViewport(2);

      expect(viewport.zoom.get()).toEqual(2);
      expect(viewport.center.x.get()).toEqual(100);
      expect(viewport.center.y.get()).toEqual(100);
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

      // layout_space = -500, 500
      // zoom = 3;

      expect(calculateLayoutCoords({ x: 0, y: 0 }))
        .toMatchCoords({ x: -500 / 3, y: -500 / 3 });
      expect(calculateLayoutCoords({ x: 0.5, y: 0 }))
        .toMatchCoords({ x: 0, y: -500 / 3 });
      expect(calculateLayoutCoords({ x: 1, y: 0.5 }))
        .toMatchCoords({ x: 500 / 3, y: 0 });
      expect(calculateLayoutCoords({ x: 1, y: 1 }))
        .toMatchCoords({ x: 500 / 3, y: 500 / 3 });
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

      zoomViewport(1, true);
      moveViewport(0.1, 0.1); // center = 100, 100

      expect(calculateLayoutCoords({ x: 0, y: 0 }))
        .toMatchCoords({ x: -400, y: -400 });
      expect(calculateLayoutCoords({ x: 0.5, y: 0.5 }))
        .toMatchCoords({ x: 100, y: 100 });
      expect(calculateLayoutCoords({ x: 1, y: 1 }))
        .toMatchCoords({ x: 600, y: 600 });

      zoomViewport(2, true); // zoom = 2
      moveViewport(0, 0, true); // center = 0, 0

      expect(calculateLayoutCoords({ x: 0, y: 0 }))
        .toMatchCoords({ x: -250, y: -250 });
      expect(calculateLayoutCoords({ x: 0.5, y: 0.5 }))
        .toMatchCoords({ x: 0, y: 0 });
      expect(calculateLayoutCoords({ x: 1, y: 1 }))
        .toMatchCoords({ x: 250, y: 250 });
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
        .toMatchCoords({ x: 0, y: 0 });
      expect(calculateRelativeCoords({ x: 0, y: -500 }))
        .toMatchCoords({ x: 0.5, y: 0 });
      expect(calculateRelativeCoords({ x: 500, y: 0 }))
        .toMatchCoords({ x: 1, y: 0.5 });
      expect(calculateRelativeCoords({ x: 500, y: 500 }))
        .toMatchCoords({ x: 1, y: 1 });
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
        .toMatchCoords({ x: 0, y: 0 });
      expect(calculateRelativeCoords({ x: 100, y: 100 }))
        .toMatchCoords({ x: 0.5, y: 0.5 });
      expect(calculateRelativeCoords({ x: 600, y: 600 }))
        .toMatchCoords({ x: 1, y: 1 });
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
        .toMatchCoords({ x: 0, y: 0 });
      expect(calculateRelativeCoords({ x: 0, y: 0 }))
        .toMatchCoords({ x: 0.5, y: 0.5 });
      expect(calculateRelativeCoords({ x: 250, y: 250 }))
        .toMatchCoords({ x: 1, y: 1 });
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
        .toMatchCoords({ x: 0, y: 0 });
      expect(calculateRelativeCoords({ x: 100, y: 100 }))
        .toMatchCoords({ x: 0.5, y: 0.5 });
      expect(calculateRelativeCoords({ x: 350, y: 350 }))
        .toMatchCoords({ x: 1, y: 1 });
    });
  });
});
