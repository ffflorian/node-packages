/* eslint-disable no-magic-numbers */
import {describe, test} from 'vitest';
import {Pixelflut} from './index.js';

describe.skip('Pixelflut', () => {
  const pf = new Pixelflut('localhost', 8080, 0);

  test('sends a pixel', async () => {
    const data = await pf.sendPixel(200, 200, 'ff0000');
    if (data) {
      console.info(data);
    }
  });

  test('sends many pixels', async () => {
    const pixels = Array.from(Array(100), (_, index) => ({
      color: '00ff00',
      xPosition: index,
      yPosition: index,
    }));

    const data = await pf.sendPixels(pixels);
    if (data) {
      console.info('data', data);
    }
  });
});
