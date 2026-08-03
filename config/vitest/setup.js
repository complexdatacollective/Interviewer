import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { vi } from 'vitest';

// Configure Enzyme
configure({ adapter: new Adapter() });

// Polyfills. requestAnimationFrame is backed by a timer, so a queued animation
// callback (e.g. animejs's engine loop) can fire AFTER jsdom teardown, when
// globals like requestAnimationFrame are gone — animejs then re-references the
// missing global and throws a ReferenceError that surfaces as an unhandled
// exception and flakily fails the run. cancelAnimationFrame clears the timer so
// well-behaved callers can stop their loop; the try/catch swallows the
// post-teardown case (purely a test-env artifact — rAF always exists in a real
// browser) without hiding any in-test failure.
global.requestAnimationFrame = (callback) =>
  setTimeout(() => {
    try {
      callback(Date.now());
    } catch {
      // animation callback fired after environment teardown; ignore.
    }
  }, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.SVGElement = global.Element;

// window.matchMedia stub
Object.defineProperty(window, 'matchMedia', {
  value: () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  }),
});

// Mock window.electronAPI (new IPC architecture)
window.electronAPI = {
  ipc: {
    send: vi.fn(),
    on: vi.fn(() => vi.fn()),
    once: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showMessageBox: vi.fn(),
  },
  app: {
    getPath: vi.fn(),
    getAppPath: vi.fn(),
    getVersion: vi.fn(() => '6.5.4'),
  },
  fs: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    pathExists: vi.fn(),
    readJson: vi.fn(),
    writeJson: vi.fn(),
    rmdir: vi.fn(() => Promise.resolve()),
    remove: vi.fn(() => Promise.resolve()),
  },
  path: {
    join: vi.fn((...args) => args.join('/')),
    basename: vi.fn((p) => p.split('/').pop()),
    dirname: vi.fn((p) => p.split('/').slice(0, -1).join('/')),
  },
  shell: {
    openExternal: vi.fn(),
    openPath: vi.fn(),
  },
  env: {
    isDevelopment: false,
    isProduction: true,
    isPreview: false,
    platform: 'darwin',
  },
  platform: 'darwin',
};

// Auto-mocks
vi.mock('electron');
vi.mock('electron-log');
vi.mock('fs');
vi.mock('redux-logger');
vi.mock('uuid');

// Mock console.error
global.console.error = vi.fn();

// Jest compatibility layer - allows existing jest.fn() calls to work
global.jest = vi;
