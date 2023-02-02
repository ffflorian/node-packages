#!/usr/bin/env node

import * as fs from 'fs-extra';
import icongen from 'icon-gen';
import Jimp from 'jimp';
import * as path from 'path';

// eslint-disable-next-line no-magic-numbers
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
    const fileName = `${size.toString()}.png`;

    await fs.ensureDir(this.options.output);
    await fs.ensureDir(this.iconsDir);
    await fs.ensureDir(this.PNGoutputDir);

    const image = await Jimp.read(this.options.input);
    const resizeFile = path.join(this.PNGoutputDir, fileName);

    await new Promise((resolve, reject) =>
      image.resize(size, size, (error, result) => (error ? reject(error) : resolve(result)))
    );
    await image.writeAsync(resizeFile);

    return `Created "${resizeFile}"`;
  }

  private async createPNGs(position: number): Promise<void> {
    const info = await this.createPNG(pngSizes[position]);

    this.logConsole(info);

    if (position < pngSizes.length - 1) {
      await this.createPNGs(position + 1);
    } else {
      const macIconsDir = path.join(this.iconsDir, 'mac');
      const winIconsDir = path.join(this.iconsDir, 'win');

      await fs.ensureDir(macIconsDir);

      await icongen(this.PNGoutputDir, macIconsDir, {
        icns: {
          name: 'icon',
          sizes: pngSizes,
        },
        report: !this.options.silent,
      });

      await fs.ensureDir(winIconsDir);

      await icongen(this.PNGoutputDir, winIconsDir, {
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
