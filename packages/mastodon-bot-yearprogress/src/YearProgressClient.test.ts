import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, test} from 'vitest';

import {YearProgressClient} from './YearProgressClient.js';

async function createConfig(content: object): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'yearprogress-'));
  const configFile = path.join(dir, 'config.json');
  await fs.writeFile(configFile, JSON.stringify(content), 'utf-8');
  return configFile;
}

describe('YearProgressClient', () => {
  test('throws when baseURL or accessToken are missing', async () => {
    const configFile = await createConfig({});
    expect(() => new YearProgressClient({configFile})).toThrow('No baseURL or access token specified.');
  });

  test('throws when baseURL does not start with http protocol', async () => {
    const configFile = await createConfig({accessToken: 'abc', baseURL: 'example.com'});
    expect(() => new YearProgressClient({configFile})).toThrow('base URL needs to begin with "http(s)://"');
  });

  test('calculatePercentage returns 0 on first day of year', async () => {
    const configFile = await createConfig({accessToken: 'abc', baseURL: 'https://example.com'});
    const client = new YearProgressClient({configFile});
    expect((client as any).calculatePercentage('2026-01-01')).toBe(0);
  });

  test('generateMessage returns progress bar and percent', async () => {
    const configFile = await createConfig({accessToken: 'abc', baseURL: 'https://example.com'});
    const client = new YearProgressClient({configFile});
    expect((client as any).generateMessage(42)).toMatch(/42%$/);
  });

  test('checkIfShouldToot returns false in dry run mode', async () => {
    const configFile = await createConfig({
      accessToken: 'abc',
      baseURL: 'https://example.com',
      dryRun: true,
      lastProgress: 10,
      lastTootDate: '2026-01-01',
    });
    const client = new YearProgressClient({configFile});
    expect((client as any).checkIfShouldToot(50, '2026-01-02')).toBe(false);
  });

  test('checkIfShouldToot returns true in force sending mode', async () => {
    const configFile = await createConfig({accessToken: 'abc', baseURL: 'https://example.com', forceSending: true});
    const client = new YearProgressClient({configFile});
    expect((client as any).checkIfShouldToot(10, '2026-01-01')).toBe(true);
  });
});
