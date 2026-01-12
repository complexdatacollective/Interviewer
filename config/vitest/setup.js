import { vi } from 'vitest';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// Configure Enzyme
configure({ adapter: new Adapter() });

// Polyfills
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = () => {};
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
