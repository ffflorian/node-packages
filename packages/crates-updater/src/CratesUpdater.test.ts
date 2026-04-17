import {beforeEach, describe, expect, test, vi} from 'vitest';

const getVersionsMock = vi.hoisted(() => vi.fn());

vi.mock('crates.io', () => ({
  CratesIO: class {
    api = {
      crates: {
        getVersions: getVersionsMock,
      },
    };
  },
  Version: class {},
}));

const modulePromise = import('./CratesUpdater.js');

describe('CratesUpdater', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getVersions returns API versions', async () => {
    getVersionsMock.mockResolvedValue({versions: [{num: '1.0.0'}]});
    const {getVersions} = await modulePromise;

    const versions = await getVersions('example');

    expect(getVersionsMock).toHaveBeenCalledWith('example');
    expect(versions).toEqual([{num: '1.0.0'}]);
  });

  test('getLatestVersion returns highest version from unsorted input', async () => {
    getVersionsMock.mockResolvedValue({versions: [{num: '1.2.0'}, {num: '1.10.0'}, {num: '1.3.0'}]});
    const {getLatestVersion} = await modulePromise;

    const latest = await getLatestVersion('example');

    expect(latest.num).toBe('1.10.0');
  });

  test('checkForUpdate returns latest when newer version exists', async () => {
    getVersionsMock.mockResolvedValue({versions: [{num: '2.0.0'}, {num: '1.0.0'}]});
    const {checkForUpdate} = await modulePromise;

    await expect(checkForUpdate('example', '1.5.0')).resolves.toBe('2.0.0');
  });

  test('checkForUpdate returns null when versions are equal', async () => {
    getVersionsMock.mockResolvedValue({versions: [{num: '1.5.0'}]});
    const {checkForUpdate} = await modulePromise;

    await expect(checkForUpdate('example', '1.5.0')).resolves.toBeNull();
  });

  test('checkForUpdate returns null when local version is newer', async () => {
    getVersionsMock.mockResolvedValue({versions: [{num: '1.2.0'}]});
    const {checkForUpdate} = await modulePromise;

    await expect(checkForUpdate('example', '1.9.0')).resolves.toBeNull();
  });
});
