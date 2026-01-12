import { vi } from 'vitest';
import environments from '../environments';

export const isElectron = vi.fn(() => false);
export const isDevMode = vi.fn(() => false);
export const isPreview = vi.fn(() => false);
export const getEnv = vi.fn(() => ({}));
export const isMacOS = vi.fn(() => false);
export const isWindows = vi.fn(() => false);
export const isLinux = vi.fn(() => false);
export const isCordova = vi.fn(() => false);
export const isIOS = vi.fn(() => false);
export const isAndroid = vi.fn(() => false);
export const isWeb = vi.fn(() => true);
export const getEnvironment = vi.fn(() => environments.WEB);

const inEnvironment = vi.fn((tree) => (...args) => tree(getEnvironment())(...args));

export default inEnvironment;
