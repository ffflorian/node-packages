import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ScrabbleCheater} from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wordList = path.resolve(__dirname, 'wordlist.txt');
const emptyList = path.resolve(__dirname, 'empty.txt');

describe('ScrabbleCheater', () => {
  it('finds all words', done => {
    const sc = new ScrabbleCheater(wordList, {letters: 'her', quietMode: true});
    sc.start()
      .then(matches => {
        expect(matches.includes('here')).toBe(true);
        expect(matches.includes('her')).toBe(true);
        expect(matches.includes('he')).toBe(true);
        done();
      })
      .catch(done.fail);
  });

  it(`Doesn't accept an empty file`, done => {
    const sc = new ScrabbleCheater(emptyList);
    sc.start()
      .then(() => done.fail())
      .catch(() => done());
  });
});
