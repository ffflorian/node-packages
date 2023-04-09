import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import nock from 'nock';
import fs from 'fs-extra';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import uuid from 'uuid';

import {ElectronInfo, RawReleaseInfo} from '../src/ElectronInfo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.resolve(__dirname, '.temp');
const tempDirDownload = path.resolve(__dirname, '.temp/download');
const mockUrl = 'http://example.com';
const invalidUrl = 'http://invalid.inv';
const fixturesDir = path.resolve(__dirname, 'fixtures');
const fullReleasesFile = path.join(fixturesDir, 'electron-releases-full.json');

const createRandomBody = (): RawReleaseInfo[] => [
  {
    name: 'electron v8.0.0-nightly.20190820',
    node_id: uuid.v4(),
    npm_dist_tags: [],
    prerelease: !!Math.round(Math.random()),
    published_at: new Date().toUTCString(),
    tag_name: 'v8.0.0-nightly.20190820',
    // eslint-disable-next-line no-magic-numbers
    total_downloads: Math.round(Math.random() * 1000),
    version: '8.0.0-nightly.20190820',
  },
];

const provideReleaseFile = async () => {
  await fs.copy(fullReleasesFile, path.join(tempDirDownload, 'latest.json'));
};

describe('ElectronInfo', () => {
  let releases: string;

  beforeAll(async () => {
    await fs.ensureDir(tempDir);
    releases = await fs.readFile(fullReleasesFile, 'utf8');
  });

  beforeEach(() => nock(mockUrl).get('/').reply(HTTP_STATUS.OK, releases));

  afterAll(() => fs.remove(tempDir));

  afterEach(() => nock.cleanAll());

  describe('getElectronReleases', () => {
    it('Parses Electron versions', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getElectronReleases('5.0.8');

      expect(result.length).toBe(1);
      expect(result[0].version).toBe('5.0.8');
    });

    it('Parses Electron SemVer', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getElectronReleases('^5');

      // eslint-disable-next-line no-magic-numbers
      expect(result.length).toBe(23);
    });

    it('Parses dist tags', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getElectronReleases('5-0-x');

      expect(result.length).toBe(1);
    });

    it('Returns nothing for invalid versions', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getElectronReleases('invalid');

      expect(result.length).toBe(0);
    });

    it('Forces downloading the release file', async () => {
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
    it('Parses Chrome versions', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getDependencyReleases('chrome', '71.0.3578.98');

      expect(result.length).toBe(2);
      expect(result[0].deps).toBeDefined();
      expect(result[0].deps!.chrome).toBe('71.0.3578.98');
    });

    it('Parses Chrome SemVer', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getDependencyReleases('chrome', '~66');

      // eslint-disable-next-line no-magic-numbers
      expect(result.length).toBe(56);
    });

    it('Returns nothing for invalid versions', async () => {
      const result = await new ElectronInfo({
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getDependencyReleases('chrome', 'invalid');

      expect(result.length).toBe(0);
    });

    it('Limits releases', async () => {
      const limit = 2;

      const result = await new ElectronInfo({
        limit,
        releasesUrl: mockUrl,
        tempDirectory: tempDir,
      }).getDependencyReleases('chrome', 'all');

      expect(result.length).toBe(limit);
    });

    it('Uses a local copy of the releases', async () => {
      nock(invalidUrl).get('/').reply(HTTP_STATUS.NOT_FOUND);

      await provideReleaseFile();

      await new ElectronInfo({
        releasesUrl: invalidUrl,
        tempDirectory: tempDirDownload,
      }).getDependencyReleases('chrome', 'all');
    });

    it('Uses latest as alias for limit=1', async () => {
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
