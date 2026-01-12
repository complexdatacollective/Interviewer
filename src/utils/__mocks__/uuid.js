import { vi } from 'vitest';

const uuidv4 = vi.fn(() => {
  // Generate a real fake UID
  const bytes = Array.from(Array(16), () => Math.floor(Math.random() * 256));
  const s = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
});

export default uuidv4;
