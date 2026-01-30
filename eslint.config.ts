import config from '@ffflorian/eslint-config';
import {defineConfig, globalIgnores} from 'eslint/config';

export default defineConfig([config, globalIgnores(['packages/exposure-keys/proto/**'])]);
