import os from 'node:os';
import process from 'node:process';
import {describe, expect, test} from 'vitest';

import {getOsInfo, isARM, isDarwin, isIA32, isLinux, isMacOS, isWin, isWin32, isWindows, isX64} from './which-os.js';

describe('which-os', () => {
  test('getOsInfo contains current platform', () => {
    expect(getOsInfo().platform).toBe(os.platform());
  });

  test('getOsInfo includes arch and cpus', () => {
    const info = getOsInfo();
    expect(info.arch).toBe(os.arch());
    expect(Array.isArray(info.cpus)).toBe(true);
  });

  test('platform helpers match process platform', () => {
    expect(isDarwin()).toBe(process.platform === 'darwin');
    expect(isLinux()).toBe(process.platform === 'linux');
    expect(isWin32()).toBe(process.platform === 'win32');
  });

  test('alias helpers match original functions', () => {
    expect(isMacOS()).toBe(isDarwin());
    expect(isWin()).toBe(isWin32());
    expect(isWindows()).toBe(isWin32());
  });

  test('arch helpers match process architecture', () => {
    expect(isX64()).toBe(process.arch === 'x64');
    expect(isARM()).toBe(process.arch === 'arm');
    expect(isIA32()).toBe(process.arch === 'ia32');
  });
});
