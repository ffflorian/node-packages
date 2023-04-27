import os from 'node:os';
import process from 'node:process';

const platform = os.platform();

interface OSInfo {
  arch: string;
  constants: {
    errno: Record<string, number>;
    priority: Record<string, number>;
    signals: Record<string, number>;
    UV_UDP_REUSEADDR: number;
  };
  cpus: os.CpuInfo[];
  endianness: 'BE' | 'LE';
  EOL: string;
  freemem: number;
  getPriority: number;
  homedir: string;
  hostname: string;
  loadavg: number[];
  networkInterfaces: Record<string, os.NetworkInterfaceInfo[]>;
  platform: NodeJS.Platform;
  release: string;
  tmpdir: string;
  totalmem: number;
  type: string;
  uptime: number;
  userInfo: os.UserInfo<string>;
}

export function getOsInfo(): OSInfo {
  return Object.entries(os)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .reduce((map: any, [key, value]) => {
      if (typeof value === 'function') {
        if (key.startsWith('set')) {
          return map;
        }
        // eslint-disable-next-line
        map[key] = (value as any)();
      } else {
        map[key] = JSON.parse(JSON.stringify(value));
      }
      return map;
    }, {});
}

export const isDarwin = (): boolean => platform === 'darwin';
export const isLinux = (): boolean => platform === 'linux';
export const isWin32 = (): boolean => platform === 'win32';

export const isX64 = (): boolean => process.arch === 'x64';
export const isARM = (): boolean => process.arch === 'arm';
export const isIA32 = (): boolean => process.arch === 'ia32';

export {isDarwin as isMacOS, isWin32 as isWin, isWin32 as isWindows};
