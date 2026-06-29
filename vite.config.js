import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import {
    nativephpHotFile,
    nativephpMobile,
} from './vendor/nativephp/mobile/resources/js/vite-plugin.js';

export default defineConfig({
    logLevel: 'error',
    clearScreen: false,
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            hotFile: nativephpHotFile(),
        }),
        react(),
        nativephpMobile(),
    ],
    server: {
        watch: {
            usePolling: true,
            interval: 100, // Memeriksa perubahan setiap 100ms
        },
    },
});
