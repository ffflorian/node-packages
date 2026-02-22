import path from 'node:path';
import {assert, describe, expect, test} from 'vitest';

import {ScrabbleCheater} from './index.js';

const __dirname = import.meta.dirname;

const wordList = path.resolve(__dirname, '../fixtures/wordlist.txt');
const emptyList = path.resolve(__dirname, '../fixtures/empty.txt');

describe('ScrabbleCheater', () => {
  test('finds all words', async () => {
    const sc = new ScrabbleCheater(wordList, {letters: 'her', quietMode: true});
    const matches = await sc.start();
    expect(matches.includes('here')).toBe(true);
    expect(matches.includes('her')).toBe(true);
    expect(matches.includes('he')).toBe(true);
  });

  test(`Doesn't accept an empty file`, async () => {
    const sc = new ScrabbleCheater(emptyList);
    await expect(sc.start()).rejects.toThrowError();
  });
});
