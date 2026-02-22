import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import nock from 'nock';
import fs from 'node:fs/promises';
import path from 'node:path';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, test} from 'vitest';

import type {RawReleaseInfo} from './interfaces.js';

import {ElectronInfo} from './ElectronInfo.js';

const __dirname = import.meta.dirname;
const tempDir = path.resolve(__dirname, '.temp');
const tempDirDownload = path.resolve(__dirname, '.temp/download');
const mockUrl = 'http://example.com';
const invalidUrl = 'http://invalid.inv';
const fixturesDir = path.resolve(__dirname, '../fixtures');
const fullReleasesFile = path.join(fixturesDir, 'electron-releases-full.json');

const createRandomBody = (): RawReleaseInfo[] => [
  {
    chrome: '76.0.3789.0',
    date: new Date().toUTCString().split('T')[0],
    files: [],
    fullDate: new Date().toUTCString(),
    modules: '69',
    node: '12.0.0',
    openssl: '1.1.1c',
    uv: '1.32.0',
    v8: '7.6.303.29',
    version: '8.0.0-nightly.20190820',
    zlib: '1.2.11',
  },
];

const provideReleaseFile = async () => {
  await fs.cp(fullReleasesFile, path.join(tempDirDownload, 'latest.json'));
};

describe('ElectronInfo', () => {
  let releases: string;

  beforeAll(async () => {
    try {
      await fs.mkdir(tempDir);
    } catch {
      // no-op
    }
    releases = await fs.readFile(fullReleasesFile, 'utf8');
  });

  beforeEach(() => {
    nock(mockUrl).get('/').reply(HTTP_STATUS.OK, releases);
  });

  afterAll(() => fs.rm(tempDir, {force: true, recursive: true}));

  afterEach(() => nock.cleanAll());

  describe.skip('getElectronReleases', () => {
    test('parses Electron versions', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getElectronReleases('5.0.8');

      expect(result.length).toBe(1);
      expect(result[0].version).toBe('5.0.8');
    });

    test('parses Electron SemVer', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getElectronReleases('^5');

      // eslint-disable-next-line no-magic-numbers
      expect(result.length).toBe(23);
    });

    test('parses dist tags', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getElectronReleases('5-0-x');

      expect(result.length).toBe(1);
    });

    test('returns nothing for invalid versions', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getElectronReleases('invalid');

      expect(result.length).toBe(0);
    });

    test('forces downloading the release file', async () => {
      const customBody = createRandomBody();
      const customUrl = 'http://custom.com';

      await provideReleaseFile();

      nock(customUrl).get('/').reply(HTTP_STATUS.OK, customBody);

      const result = await new ElectronInfo({
        forceUpdate: true,
        releasesUrl: customUrl,
        tempDirectory: tempDirDownload,
      }).getElectronReleases('all');

      expect(result).toEqual(customBody);
    });
  });

  describe('getDependencyReleases', () => {
    test('parses Chrome versions', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getDependencyReleases('chrome', '71.0.3578.98');

      expect(result.length).toBe(2);
      expect(result[0].chrome).toBe('71.0.3578.98');
    });

    test('parses Chrome SemVer', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getDependencyReleases('chrome', '~66');

      // eslint-disable-next-line no-magic-numbers
      expect(result.length).toBe(56);
    });

    test('returns nothing for invalid versions', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getDependencyReleases('chrome', 'invalid');

      expect(result.length).toBe(0);
    });

    test('limits releases', async () => {
      const limit = 2;

      const result = await new ElectronInfo({
        limit,
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getDependencyReleases('chrome', 'all');

      expect(result.length).toBe(limit);
    });

    test('uses a local copy of the releases', async () => {
      nock(invalidUrl).get('/').reply(HTTP_STATUS.NOT_FOUND);

      await provideReleaseFile();

      await new ElectronInfo({
        releasesUrl: invalidUrl,
        tempDirectory: tempDirDownload,
      }).getDependencyReleases('chrome', 'all');
    });

    test('uses latest as alias for limit=1', async () => {
      const result = await new ElectronInfo({
        latest: true,
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getElectronReleases('all');

      expect(result.length).toBe(1);
      expect(result[0].version).toBe('8.0.0-nightly.20190820');
    });
  });
});
