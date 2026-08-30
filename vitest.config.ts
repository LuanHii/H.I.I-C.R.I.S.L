import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const src = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/ui\/(.*)$/, replacement: `${src}/components/ui/$1` },
      { find: /^@\/lib\/(.*)$/, replacement: `${src}/lib/$1` },
      { find: /^@\/(.*)$/, replacement: `${src}/$1` },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: false,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['src/core/**', 'src/logic/**', 'src/op2/**'],
      exclude: ['src/**/*.{test,spec}.ts', 'src/testUtils/**'],
    },
  },
});
