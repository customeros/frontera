import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import graphqlLoader from 'vite-plugin-graphql-loader';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    name: 'Frontera unit tests',
    include: ['**/*.test.ts'],
    testTimeout: 30000,
    setupFiles: [],
    hookTimeout: 60000,
  },
  plugins: [
    react({
      babel: {
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            {
              version: '2023-05',
            },
          ],
        ],
      },
    }),
    graphqlLoader(),
  ],
  resolve: {
    alias: {
      '@infra': path.resolve(__dirname, './src/infra'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@graphql/types': path.resolve(
        __dirname,
        './src/routes/src/types/__generated__/graphql.types.ts',
      ),
      '@shared/types/__generated__/graphql.types': path.resolve(
        __dirname,
        './src/routes/src/types/__generated__/graphql.types.ts',
      ),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@finder': path.resolve(__dirname, './src/routes/finder/src'),
      '@domain': path.resolve(__dirname, './src/domain'),
    },
  },
});
