import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map();
vi.mock('localforage', () => ({
  default: {
    config: vi.fn(),
    getItem: vi.fn((k) => Promise.resolve(store.has(k) ? store.get(k) : null)),
    setItem: vi.fn((k, v) => {
      store.set(k, v);
      return Promise.resolve(v);
    }),
    removeItem: vi.fn((k) => {
      store.delete(k);
      return Promise.resolve();
    }),
  },
}));

import { localforageStorageEngine } from '../storageAdapters';

describe('localforageStorageEngine', () => {
  beforeEach(() => store.clear());

  it('calls onPersistReady and round-trips values', async () => {
    const onPersistReady = vi.fn();
    const engine = localforageStorageEngine(onPersistReady);
    await Promise.resolve();
    expect(onPersistReady).toHaveBeenCalledTimes(1);

    await engine.setItem('k', 'v');
    expect(await engine.getItem('k')).toBe('v');
    await engine.removeItem('k');
    expect(await engine.getItem('k')).toBeNull();
  });
});
