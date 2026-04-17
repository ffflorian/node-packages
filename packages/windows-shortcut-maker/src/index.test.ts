import {describe, expect, test, vi} from 'vitest';

const existsSyncMock = vi.hoisted(() => vi.fn());
const isDirectoryMock = vi.hoisted(() => vi.fn());
const spawnMock = vi.hoisted(() => vi.fn());
const spawnSyncMock = vi.hoisted(() => vi.fn());

vi.mock('node:fs', () => ({
  default: {
    existsSync: existsSyncMock,
    lstatSync: () => ({isDirectory: isDirectoryMock}),
  },
}));

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
  spawnSync: spawnSyncMock,
}));

const modulePromise = import('./index.js');

function createMockProcess(mode: 'error' | 'exit' = 'exit') {
  const handlers: Record<string, (error?: Error) => void> = {};
  const processMock = {
    on(event: string, callback: (error?: Error) => void) {
      handlers[event] = callback;
      if (event === mode) {
        queueMicrotask(() => callback(mode === 'error' ? new Error('spawn failed') : undefined));
      }
      return processMock;
    },
  };
  return processMock;
}

describe('windows-shortcut-maker', () => {
  test('make throws if target file does not exist and force is false', async () => {
    existsSyncMock.mockReturnValue(false);
    const {make} = await modulePromise;

    expect(() => make({filepath: 'C:/missing.exe'})).toThrow('does not exist');
  });

  test('make resolves when spawn exits', async () => {
    existsSyncMock.mockReturnValue(true);
    isDirectoryMock.mockReturnValue(true);
    spawnMock.mockReturnValue(createMockProcess('exit'));
    const {make} = await modulePromise;

    await expect(make({filepath: 'C:/app.exe'})).resolves.toBeUndefined();
    expect(spawnMock).toHaveBeenCalledWith('wscript', expect.any(Array));
  });

  test('make rejects when spawn emits an error', async () => {
    existsSyncMock.mockReturnValue(true);
    isDirectoryMock.mockReturnValue(true);
    spawnMock.mockReturnValue(createMockProcess('error'));
    const {make} = await modulePromise;

    await expect(make({filepath: 'C:/app.exe'})).rejects.toThrow('spawn failed');
  });

  test('makeSync calls spawnSync with wscript', async () => {
    existsSyncMock.mockReturnValue(true);
    isDirectoryMock.mockReturnValue(true);
    const {makeSync} = await modulePromise;

    makeSync({filepath: 'C:/app.exe'});

    expect(spawnSyncMock).toHaveBeenCalledWith('wscript', expect.any(Array));
  });

  test('make accepts filepath as string input', async () => {
    existsSyncMock.mockReturnValue(true);
    isDirectoryMock.mockReturnValue(true);
    spawnMock.mockReturnValue(createMockProcess('exit'));
    const {make} = await modulePromise;

    await expect(make('C:/app.exe')).resolves.toBeUndefined();
    expect(spawnMock.mock.calls[0][1][1]).toBe('C:/app.exe');
  });
});
