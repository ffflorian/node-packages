# windows-shortcut-maker [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/@ffflorian/windows-shortcut-maker.svg)](https://www.npmjs.com/package/@ffflorian/windows-shortcut-maker)

Native and lightweight module to make file shortcuts on Windows using Node.js.

Based on https://github.com/phtdacosta/windows-shortcut-maker.

This module uses a Windows VBScript file to get native access to the operational system API responsible for making file shortcuts.

## Why this module is great?

- Although it is native, there is no need to compile anything.
- It is totally open source and uses no binary files, no external dependencies and no bizarre workarounds.
- Supports all Windows NT 4.0 (and beyond) systems.
- The module is extremely small and provides access to the entire API.

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com) < 2

## Installation

ℹ️ This is a hybrid [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) / [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn global add @ffflorian/windows-shortcut-maker` or `npm i -g @ffflorian/windows-shortcut-maker`

## Basic usage

```ts
// Requires the Windows Shortcut Maker module
import {make, makeSync, ShortcutOptions} from 'windows-shortcut-maker';

// Creates an object to store all parameters to be passed to the Windows API
const options: ShortcutOptions = {
  filepath: 'C:\\Program Files\\GIMP 2\\bin\\gimp-2.8.exe',
};

// Creates a "GIMP" shortcut file on the desktop
sm.make(options).catch(error => {
  console.error(error);
});

// Creates an object to store all parameters to be passed to the Windows API
const options: ShortcutOptions = {
  filepath: 'C:\\Program Files\\GIMP 2\\bin\\gimp-2.8.exe',
  linkFilepath: '.',
};

// Synchronously creates a "GIMP" shortcut file in the current directory
try {
  sm.makeSync(options);
} catch (error) {
  console.error(error);
}
```

## Documentation

### `make(options)`

> Returns `void` after asynchronously executing the wrapped script which makes the Windows API calls or throws an `Error` if no valid `filepath` parameter property was previously specified.

**`options`** is an `Object` that organizedly stores the properties used by the function. Each one is covered below.

**`options.filepath`** is the absolute path including the name of which file should the module make a shortcut. **It is required** for the function to work.

**Optional:** **`options.force`** create the shortcut even if the original file cannot be found.

**Optional:** **`options.linkArgs`** are the arguments passed to the original file when the new shortcut is executed.

**Optional:** **`options.linkCwd`** is the absolute path in which folder the original file should start executing.

**Optional:** **`options.linkDescription`** is the description message shown when the cursor stands over the new shortcut without clicking it.

**Optional:** **`options.linkFilepath`** is the folder where to save the link (default is the current user's desktop)

**Optional:** **`options.linkHotkey`** is the key combination that is going to trigger the new shortcut execution. (e.g. `'ALT+CTRL+F'`)

**Optional:** **`options.linkIcon`** is the absolute path to an `.ico` extension image used as the icon for the new shortcut.

**Optional:** **`options.linkName`** is the name given for the new shortcut file which obeys the same name rules as a regular file does.

**Optional:** **`options.linkWindowMode`** is the initial window mode adopted by the original file when executed. (e.g. `3` is maximized, `4` is normal and `7` is minimized)

## `makeSync(options)`

> Returns `void` after synchronously executing the wrapped script which makes the Windows API calls or throws an `Error` if no valid `filepath` parameter property was previously specified.
>
> The API is the same as `makeSync()`
