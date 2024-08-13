# electron-icon-generator [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/@ffflorian/electron-icon-generator.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/electron-icon-generator)

Based on https://github.com/jaretburkett/electron-icon-maker.

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com)

## Installation

ℹ️ This is a pure [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn global add @ffflorian/electron-icon-generator` or `npm i -g @ffflorian/electron-icon-generator`

## Usage

```
electron-icon-generator --input /path/to/image.png --output /path/to/folder
```

## Arguments

```
Usage: electron-icon-generator [options]

An icon generator to generate all the icon files needed for electron packaging

Options:
  -V, --version          output the version number
  -i, --input <file>     Input PNG file (recommended size: 1024x1024) (default: "./icon.png")
  -o, --output <folder>  Folder to output new icons folder (default: "./")
  -s, --silent           Don't log anything beside errors
  -h, --help             output usage information
```

## Recommendations

Input file should be 1024\*1024px or larger. Make sure it is a 1:1 aspect ratio on width to height.

## Output structure

```
[output dir]
  -[icons]
    -[mac]
      - icon.icns
      -[png]
        - 16x16.png
        - 24x24.png
          ...
        - 512x512.png
        - 1024x1024.png
      -[win]
        -icon.ico
```
