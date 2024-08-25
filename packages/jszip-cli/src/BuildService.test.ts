import {expect, describe, test, vi, beforeEach, beforeAll} from 'vitest';
import {JSZipCLI} from '.';
import type {BuildService} from './BuildService';

describe('BuildService', () => {
  let jsZipCLI: JSZipCLI;

  beforeAll(() => {
    vi.mock('fs-extra', () => ({
      default: {
        lstat: () => Promise.resolve({isDirectory: () => false, isFile: () => true}),
        readFile: () => {},
      },
    }));
    vi.mock('glob', () => ({
      globSync: (params: string | string[]) => (typeof params === 'string' ? [params] : params),
    }));
  });

  const addDefaultSpies = (buildService: BuildService) => {
    vi.spyOn<any, any>(buildService, 'checkOutput').mockReturnValue(() => Promise.resolve());
    vi.spyOn<any, any>(buildService, 'addFile');
    vi.spyOn<any, any>(buildService['fileService'], 'writeFile').mockReturnValue(Promise.resolve());
  };

  beforeEach(() => {
    jsZipCLI = new JSZipCLI({
      outputEntry: 'file.zip',
      quiet: true,
      verbose: false,
    });
  });

  test('adds specified files', async () => {
    const files = ['a.js', 'b.js'];
    const buildService = jsZipCLI.add(files);

    addDefaultSpies(buildService);

    const {compressedFilesCount} = await jsZipCLI.save();
    expect(compressedFilesCount).toBe(2);

    expect(buildService['addFile']).toHaveBeenCalledWith(expect.objectContaining({zipPath: 'a.js'}));
    expect(buildService['addFile']).toHaveBeenCalledWith(expect.objectContaining({zipPath: 'b.js'}));
    expect(buildService['fileService'].writeFile).toHaveBeenCalledTimes(1);
  });

  test('ignores specified files', async () => {
    jsZipCLI = new JSZipCLI({
      ignoreEntries: ['*.map'],
      outputEntry: 'file.zip',
      quiet: true,
      verbose: false,
    });
    const files = ['a.js', 'b.js', 'b.js.map'];
    const buildService = jsZipCLI.add(files);

    addDefaultSpies(buildService);

    const {compressedFilesCount} = await jsZipCLI.save();
    expect(compressedFilesCount).toBe(2);

    expect(buildService['addFile']).toHaveBeenCalledWith(expect.objectContaining({zipPath: 'a.js'}));
    expect(buildService['addFile']).toHaveBeenCalledWith(expect.objectContaining({zipPath: 'b.js'}));
    expect(buildService['addFile']).not.toHaveBeenCalledWith(expect.objectContaining({zipPath: 'b.js.map'}));
    expect(buildService['fileService'].writeFile).toHaveBeenCalledTimes(1);
  });

  test('allows RegExp usage for ignoreEntries', async () => {
    jsZipCLI = new JSZipCLI({
      ignoreEntries: [/.*\.map/],
      outputEntry: 'file.zip',
      quiet: true,
      verbose: false,
    });
    const files = ['a.js', 'b.js', 'b.js.map'];
    const buildService = jsZipCLI.add(files);

    addDefaultSpies(buildService);

    const {compressedFilesCount} = await jsZipCLI.save();
    expect(compressedFilesCount).toBe(2);

    expect(buildService['addFile']).toHaveBeenCalledWith(expect.objectContaining({zipPath: 'a.js'}));
    expect(buildService['addFile']).toHaveBeenCalledWith(expect.objectContaining({zipPath: 'b.js'}));
    expect(buildService['addFile']).not.toHaveBeenCalledWith(expect.objectContaining({zipPath: 'b.js.map'}));
    expect(buildService['fileService'].writeFile).toHaveBeenCalledTimes(1);
  });
});
