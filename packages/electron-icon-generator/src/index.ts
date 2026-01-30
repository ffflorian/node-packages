#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {Jimp} from 'jimp';
import icongen from 'icon-gen';

const pngSizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

export interface Options {
  input: string;
  output: string;
  silent?: boolean;
}

export class IconGenerator {
  private readonly iconsDir: string;
  private readonly options: Options;
  private readonly PNGoutputDir: string;

  constructor(options: Options) {
    this.options = options;
    this.logConsole(options);

    this.options.input = path.resolve(this.options.input);
    this.options.output = path.resolve(this.options.output);
    this.iconsDir = path.join(this.options.output, 'icons');
    this.PNGoutputDir = path.join(this.iconsDir, 'png');
  }

  public async start(): Promise<void> {
    await this.createPNGs(0);
  }

  private async createPNG(size: number): Promise<string> {
    const fileName = size.toString();

    try {
      await fs.mkdir(this.options.output, {recursive: true});
    } catch {
      // no-op
    }

    try {
      await fs.mkdir(this.iconsDir, {recursive: true});
    } catch {
      // no-op
    }

    try {
      await fs.mkdir(this.PNGoutputDir, {recursive: true});
    } catch {
      // no-op
    }

    const image = await Jimp.read(this.options.input);
    const resizeFilePath = path.join(this.PNGoutputDir, fileName);

    image.resize({h: size, w: size});

    await image.write(`${resizeFilePath}.png`);

    return `Created "${resizeFilePath}.png"`;
  }

  private async createPNGs(position: number): Promise<void> {
    const info = await this.createPNG(pngSizes[position]);

    this.logConsole(info);

    if (position < pngSizes.length - 1) {
      await this.createPNGs(position + 1);
    } else {
      const macIconsDir = path.join(this.iconsDir, 'mac');
      const winIconsDir = path.join(this.iconsDir, 'win');

      try {
        await fs.mkdir(macIconsDir, {recursive: true});
      } catch {
        // no-op
      }

      await icongen.default(this.PNGoutputDir, macIconsDir, {
        icns: {
          name: 'icon',
          sizes: pngSizes,
        },
        report: !this.options.silent,
      });

      try {
        await fs.mkdir(winIconsDir, {recursive: true});
      } catch {
        // no-op
      }

      await icongen.default(this.PNGoutputDir, winIconsDir, {
        icns: {
          name: 'icon',
          sizes: pngSizes,
        },
        report: !this.options.silent,
      });

      this.logConsole('Renaming PNGs to Electron Format');
      await this.renamePNGs(0);
    }
  }

  private logConsole(...messages: any[]): void {
    if (!this.options.silent) {
      console.info(...messages);
    }
  }

  private async renamePNGs(position: number): Promise<void> {
    const startName = `${pngSizes[position]}.png`;
    const endName = `${pngSizes[position]}x${pngSizes[position]}.png`;
    const startFile = path.join(this.PNGoutputDir, startName);
    const endFile = path.join(this.PNGoutputDir, endName);
    await fs.rename(startFile, endFile);

    this.logConsole(`Renamed "${startName}" to "${endName}".`);

    if (position < pngSizes.length - 1) {
      await this.renamePNGs(position + 1);
    } else {
      this.logConsole('\nAll done');
    }
  }
}
