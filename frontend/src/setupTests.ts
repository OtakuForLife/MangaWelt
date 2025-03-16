import '@testing-library/jest-dom';  // This package works with Vitest too
import { setupIonicReact } from '@ionic/react';
import { expect, afterEach } from 'vitest';
import '@testing-library/react';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

setupIonicReact();

// Mock matchmedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};
