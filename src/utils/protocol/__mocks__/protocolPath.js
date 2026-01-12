import { vi } from 'vitest';

const protocolPath = vi.fn((...args) => `tmp/mock/path/protocols/${args.join('/')}`);

export default protocolPath;
