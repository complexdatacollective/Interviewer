import { pathToFileURL } from 'node:url';

import { vi } from 'vitest';

const createMotionValue = (initialValue) => {
  let currentValue = initialValue;
  const subscribers = new Set();

  return {
    clearListeners: () => subscribers.clear(),
    destroy: () => subscribers.clear(),
    get: () => currentValue,
    getPrevious: () => currentValue,
    getVelocity: () => 0,
    isAnimating: () => false,
    on: (_eventName, callback) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    onChange: (callback) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    set: (nextValue) => {
      currentValue = nextValue;
      subscribers.forEach((callback) => callback(nextValue));
    },
    stop: () => undefined,
  };
};

const Presence = ({ children }) => children;

// The Classic applications use Framer Motion versions that predate
// MotionGlobalConfig.skipAnimations. Keep their real non-rendering exports,
// but replace animated elements and scheduling hooks with synchronous test
// equivalents so presence changes take effect immediately in jsdom.
// Resolve from the active Vitest workspace so pnpm's isolated installs target
// each Classic app's own Framer Motion version instead of this shared package.
const activeWorkspace = pathToFileURL(`${process.cwd()}/package.json`);
const framerMotionUrl = import.meta.resolve('framer-motion', activeWorkspace);

vi.doMock(framerMotionUrl, async (importOriginal) => {
  const React = await vi.importActual('react');
  const original = await importOriginal();

  const filterMotionProps = (props) => {
    const domProps = Object.fromEntries(
      Object.entries(props).filter(
        ([key]) => key === 'style' || !original.isValidMotionProp(key),
      ),
    );

    if (typeof props.onTap === 'function') {
      const onClick = domProps.onClick;
      domProps.onClick = (event) => {
        props.onTap(event);
        onClick?.(event);
      };
    }

    return domProps;
  };

  const motionComponentCache = new Map();
  const createMotionComponent = (component) => {
    if (motionComponentCache.has(component)) {
      return motionComponentCache.get(component);
    }

    const MotionComponent = React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(
        component,
        { ...filterMotionProps(props), ref },
        children,
      ),
    );
    MotionComponent.displayName =
      typeof component === 'string'
        ? `motion.${component}`
        : `motion(${component.displayName || component.name || 'Component'})`;
    motionComponentCache.set(component, MotionComponent);
    return MotionComponent;
  };

  const motionFactory = (component) => createMotionComponent(component);
  const motion = new Proxy(motionFactory, {
    apply: (_target, _thisArg, [component]) => createMotionComponent(component),
    get: (_target, property) => {
      if (property === 'custom') {
        return createMotionComponent;
      }
      if (typeof property === 'string') {
        return createMotionComponent(property);
      }
      return undefined;
    },
  });

  const useMotionValue = (initialValue) => {
    const value = React.useRef();
    if (value.current === undefined) {
      value.current = createMotionValue(initialValue);
    }
    return value.current;
  };

  const useAnimation = () =>
    React.useMemo(
      () => ({
        mount: () => () => undefined,
        set: () => undefined,
        start: () => Promise.resolve(),
        stop: () => undefined,
      }),
      [],
    );

  return {
    ...original,
    AnimatePresence: Presence,
    AnimateSharedLayout: Presence,
    m: motion,
    motion,
    useAnimation,
    useElementScroll: () => ({
      scrollX: useMotionValue(0),
      scrollXProgress: useMotionValue(0),
      scrollY: useMotionValue(0),
      scrollYProgress: useMotionValue(0),
    }),
    useMotionValue,
    useReducedMotion: () => true,
    useSpring: (initialValue) =>
      useMotionValue(initialValue?.get?.() ?? initialValue),
  };
});
