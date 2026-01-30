#!/usr/bin/env node

import {Pixelflut} from './index.js';

void (async () => {
  try {
    // eslint-disable-next-line no-magic-numbers
    const data = await new Pixelflut('localhost', 8080, 0).sendPixel(200, 200, 'ff0000');
    if (data) {
      console.info('data:', data);
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
