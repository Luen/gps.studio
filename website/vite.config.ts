import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
    /*server: {
        port: 5000,
    },*/    
    plugins: [nodePolyfills({
        globals: {
            Buffer: true,
        },
    }), enhancedImages(), sveltekit()]
});
