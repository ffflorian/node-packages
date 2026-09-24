import {defineConfig} from 'oxfmt';

import config from '@ffflorian/oxfmt-config';

export default defineConfig({
  ...config,
  ignorePatterns: [...(config.ignorePatterns || []), '**/packages/exposure-keys/proto/**'],
});
