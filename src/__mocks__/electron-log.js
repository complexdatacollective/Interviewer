import { vi } from 'vitest';

module.exports = {
  transports: {
    console: {},
    file: {},
  },
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};
