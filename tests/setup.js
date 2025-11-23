// Setup for vitest
import { vi } from 'vitest';

// Stub for localstorage if jsdom doesn't provide a persistent one or to mock it explicitly
if (!window.localStorage) {
  window.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
  };
}
