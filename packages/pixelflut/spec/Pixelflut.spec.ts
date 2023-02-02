/* eslint-disable no-magic-numbers */

import {Pixelflut} from '../src';

xdescribe('Pixelflut', () => {
  const pf = new Pixelflut('localhost', 8080, 0);

  it('sends a pixel', async () => {
    const data = await pf.sendPixel(200, 200, 'ff0000');
    if (data) {
      console.info(data);
    }
  });

  it('sends many pixels', async () => {
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

describe('Make Jasmine happy', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
});
