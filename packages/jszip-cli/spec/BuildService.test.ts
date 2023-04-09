import fs from 'fs-extra';
import {JSZipCLI} from '../src';
import type {BuildService} from '../src/BuildService';

describe('BuildService', () => {
  let jsZipCLI: JSZipCLI;

  const addDefaultSpies = (buildService: BuildService) => {
    spyOn<any>(buildService, 'checkOutput').and.returnValue(Promise.resolve());
    spyOn<any>(buildService, 'addFile').and.callThrough();
    spyOn<any>(fs, 'lstat').and.returnValue(Promise.resolve({isDirectory: () => false, isFile: () => true}));
    spyOn(fs, 'readFile').and.returnValue();
    spyOn<any>(buildService['fileService'], 'writeFile').and.returnValue(Promise.resolve());
  };

  beforeEach(() => {
    jsZipCLI = new JSZipCLI({
      outputEntry: 'file.zip',
      quiet: true,
      verbose: false,
    });
  });

  it('adds specified files', async () => {
    const files = ['a.js', 'b.js'];
    const buildService = jsZipCLI.add(files);

    addDefaultSpies(buildService);

    const {compressedFilesCount} = await jsZipCLI.save();
    expect(compressedFilesCount).toBe(2);

    expect(buildService['addFile']).toHaveBeenCalledWith(jasmine.objectContaining({zipPath: 'a.js'}));
    expect(buildService['addFile']).toHaveBeenCalledWith(jasmine.objectContaining({zipPath: 'b.js'}));
    expect(buildService['fileService'].writeFile).toHaveBeenCalledTimes(1);
  });

  it('ignores specified files', async () => {
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

    expect(buildService['addFile']).toHaveBeenCalledWith(jasmine.objectContaining({zipPath: 'a.js'}));
    expect(buildService['addFile']).toHaveBeenCalledWith(jasmine.objectContaining({zipPath: 'b.js'}));
    expect(buildService['addFile']).not.toHaveBeenCalledWith(jasmine.objectContaining({zipPath: 'b.js.map'}));
    expect(buildService['fileService'].writeFile).toHaveBeenCalledTimes(1);
  });

  it('allows RegExp usage for ignoreEntries', async () => {
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

    expect(buildService['addFile']).toHaveBeenCalledWith(jasmine.objectContaining({zipPath: 'a.js'}));
    expect(buildService['addFile']).toHaveBeenCalledWith(jasmine.objectContaining({zipPath: 'b.js'}));
    expect(buildService['addFile']).not.toHaveBeenCalledWith(jasmine.objectContaining({zipPath: 'b.js.map'}));
    expect(buildService['fileService'].writeFile).toHaveBeenCalledTimes(1);
  });
});
