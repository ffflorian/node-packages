#!/usr/bin/env node

/* eslint-disable no-magic-numbers */

import {Pixelflut} from './';

void (async () => {
  try {
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
