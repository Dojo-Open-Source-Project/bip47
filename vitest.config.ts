import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        include: ['test/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            exclude: ['docs/**/*.js', 'src/types.ts'],
        }
    }
});
