import * as path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    esbuild: {
      loader: 'jsx',
      include: /\/src\/.*\.js$/,
      exclude: [],
    },
    resolve: {
      alias: {
        '@haniffalab/cherita-react/scss': path.resolve(
          __dirname,
          '../../src/scss',
        ),
        '@haniffalab/cherita-react': path.resolve(
          __dirname,
          '../../src/lib/index.js',
        ),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: { '.js': 'jsx' },
      },
    },
    define: {
      'process.env': {
        PACKAGE_VERSION: 'dev',
        ...process.env,
        ...loadEnv(mode, process.cwd(), ''),
      },
    },
  };
});
