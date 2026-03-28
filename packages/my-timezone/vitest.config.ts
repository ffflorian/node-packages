import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      ntpclient: path.resolve(__dirname, '../ntpclient/src/index.ts'),
    },
  },
});
