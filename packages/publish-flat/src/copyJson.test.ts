import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, test, vi} from 'vitest';

import {copyJson} from './copyJson.js';

async function createTempFiles(source: object, targetRaw: string): Promise<{input: string; output: string}> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'publish-flat-'));
  const input = path.join(dir, 'input.json');
  const output = path.join(dir, 'output.json');
  await fs.writeFile(input, JSON.stringify(source, null, 2), 'utf-8');
  await fs.writeFile(output, targetRaw, 'utf-8');
  return {input, output};
}

describe('copyJson', () => {
  test('does nothing when values array is empty', async () => {
    const files = await createTempFiles({name: 'a'}, '{"version":"1.0.0"}');
    const before = await fs.readFile(files.output, 'utf-8');

    await copyJson(files.input, files.output, []);

    await expect(fs.readFile(files.output, 'utf-8')).resolves.toBe(before);
  });

  test('copies selected values from source to target', async () => {
    const files = await createTempFiles({name: 'pkg', private: true, version: '1.0.0'}, '{"version":"0.0.1"}');

    await copyJson(files.input, files.output, ['name', 'private']);

    const output = JSON.parse(await fs.readFile(files.output, 'utf-8'));
    expect(output).toMatchObject({name: 'pkg', private: true, version: '0.0.1'});
  });

  test('keeps indentation from existing target file', async () => {
    const files = await createTempFiles({name: 'pkg'}, '{\n    "version": "1.0.0"\n}');

    await copyJson(files.input, files.output, ['name']);

    const output = await fs.readFile(files.output, 'utf-8');
    expect(output).toContain('\n    "name": "pkg"');
  });

  test('logs info and handles empty output content', async () => {
    const files = await createTempFiles({name: 'pkg'}, '');
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    await copyJson(files.input, files.output, ['name']);

    expect(infoSpy).toHaveBeenCalledWith('New JSON file has no content.');
    await expect(fs.readFile(files.output, 'utf-8')).resolves.toContain('"name": "pkg"');
  });

  test('throws for missing unreadable input file', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'publish-flat-'));
    const input = path.join(dir, 'missing.json');
    const output = path.join(dir, 'output.json');
    await fs.writeFile(output, '{}', 'utf-8');

    await expect(copyJson(input, output, ['name'])).rejects.toThrow(`Input file "${input} doesn't exist`);
  });
});
