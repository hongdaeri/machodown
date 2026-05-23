import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        resolve: {
            alias: {
                '@main': resolve('src/main')
            }
        }
    },
    preload: {
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src'),
                '@components': resolve('src/renderer/src/components'),
                '@stores': resolve('src/renderer/src/stores'),
                '@hooks': resolve('src/renderer/src/hooks'),
                '@lib': resolve('src/renderer/src/lib'),
                '@styles': resolve('src/renderer/src/styles')
            }
        },
        plugins: [react()],
        worker: {
            format: 'es'
        }
    }
});
