import {expect, describe, test, vi, beforeAll, afterAll} from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import {ConfigFileOptions, JSZipCLI, TerminalOptions} from '.';

const tempDir = path.resolve(__dirname, '.temp');
const configFilePath = path.resolve(tempDir, 'config.json');

type AllOptions = Required<TerminalOptions> & Partial<ConfigFileOptions>;

const defaultOptions: Required<TerminalOptions> = {
  compressionLevel: 9,
  configFile: false,
  dereferenceLinks: true,
  force: true,
  ignoreEntries: ['*.js.map'],
  outputEntry: 'dist',
  quiet: true,
  verbose: false,
};

async function buildOptions(additionalConfig?: Partial<AllOptions>): Promise<AllOptions> {
  const fileConfig: AllOptions = {
    ...defaultOptions,
    configFile: configFilePath,
    entries: ['dist'],
    mode: 'add',
    ...additionalConfig,
  };

  await fs.writeJSON(configFilePath, fileConfig);
  return fileConfig;
}

describe('JSZipCLI', () => {
  beforeAll(() => fs.ensureDir(tempDir));
  afterAll(() => fs.remove(tempDir));

  test('can read from a configuration file', async () => {
    const builtOptions = await buildOptions();

    const jsZipCLI = new JSZipCLI(defaultOptions);
    const jsZipCLIOptionsFile = new JSZipCLI({...defaultOptions, configFile: configFilePath});

    expect(jsZipCLIOptionsFile['options']).toEqual(builtOptions);
    expect(jsZipCLIOptionsFile['options']).toEqual(
      expect.objectContaining({...jsZipCLI['options'], configFile: configFilePath})
    );
  });

  test('values constructor options over file options', async () => {
    await buildOptions({force: false});

    const jsZipCLIOptionsFile = new JSZipCLI({...defaultOptions, configFile: configFilePath});

    expect(jsZipCLIOptionsFile['options'].force).toEqual(defaultOptions.force);
  });

  test('uses the correct file mode', async () => {
    await buildOptions({mode: 'extract'});

    const jsZipCLI = new JSZipCLI({configFile: configFilePath});

    vi.spyOn(jsZipCLI, 'add');
    vi.spyOn<any, any>(jsZipCLI, 'extract').mockReturnValue(Promise.resolve({compressedFilesCount: 1, outputFile: ''}));

    await jsZipCLI.fileMode();

    expect(jsZipCLI.extract).toHaveBeenCalled();
    expect(jsZipCLI.add).not.toHaveBeenCalled();
  });

  test('sets verbose logging correctly', async () => {
    const jsZipCLI = new JSZipCLI({verbose: false});
    expect(jsZipCLI['logger'].state.isEnabled).toBe(false);
  });
});
