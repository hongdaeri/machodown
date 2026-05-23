import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@components': resolve(__dirname, 'src/renderer/src/components'),
      '@stores': resolve(__dirname, 'src/renderer/src/stores'),
      '@hooks': resolve(__dirname, 'src/renderer/src/hooks'),
      '@lib': resolve(__dirname, 'src/renderer/src/lib'),
      '@styles': resolve(__dirname, 'src/renderer/src/styles')
    }
  }
})
