import * as clipboard from 'clipboardy';
import * as fs from 'fs';
import * as readline from 'readline';
import {promisify} from 'util';
const readFileAsync = promisify(fs.readFile);

export interface Options {
  letters?: string;
  maximum?: number;
  quietMode?: boolean;
  singleMode?: boolean;
}

const defaultOptions: Required<Options> = {
  letters: '',
  maximum: 0,
  quietMode: false,
  singleMode: false,
};

export class ScrabbleCheater {
  private dictionary: string[] = [];
  private readonly options: Required<Options>;
  private readonly wordListPath: string;

  constructor(wordListPath: string, options?: Options) {
    this.wordListPath = wordListPath;
    this.options = {...defaultOptions, ...options};
  }

  public setLetters(letters: string): ScrabbleCheater {
    this.options.letters = letters;
    return this;
  }

  public async start(): Promise<string[]> {
    const length = await this.loadWords();
    if (!length) {
      throw new Error('No words loaded. Wordlist file corrupt?');
    }

    this.log(`${length} word${length > 1 ? 's' : ''} loaded.`);

    const letters = this.options.letters ? this.formatLetters(this.options.letters) : await this.readLineAsync();
    let matches = this.findMatches(letters);

    this.log(`ScrabbleCheater: ${matches.length} matches found`, true);

    if (this.options.maximum) {
      this.log(`, ${this.options.singleMode ? 'sending' : 'displaying'} the first ${this.options.maximum}`, true);
      matches = matches.slice(0, this.options.maximum);
    }

    this.log('.\n\n', true);

    if (this.options.singleMode) {
      this.singleOutput(matches);
    }

    return matches;
  }

  private findMatches(letters: string): string[] {
    const regex = new RegExp(`^[${letters}]+$`);
    return this.dictionary.filter(word => regex.test(word)).sort((wordA, wordB) => wordB.length - wordA.length);
  }

  private formatLetters(letters: string): string {
    const regex = new RegExp('[^A-Za-z]');
    return letters.replace(regex, '').toLowerCase();
  }

  private async loadWords(): Promise<number> {
    const regex = new RegExp('^[A-Za-z]+$');

    const wordList = await readFileAsync(this.wordListPath, 'utf-8');
    this.dictionary = wordList.split('\n').filter(value => regex.test(value));
    return this.dictionary.length;
  }

  private log(message: string, raw = false): void {
    if (!this.options.quietMode) {
      if (!raw) {
        console.info(`ScrabbleCheater: ${message}`);
      } else {
        process.stdout.write(message);
      }
    }
  }

  private readLineAsync(): Promise<string> {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('Letters? ', input => {
        const letters = this.formatLetters(input);
        if (letters) {
          resolve(letters);
        } else {
          reject(new Error('No letters entered.'));
        }
        rl.close();
      });
    });
  }

  private singleOutput(matches: string[]): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let counter = 0;

    const next = () => {
      clipboard.writeSync(matches[counter]);
      if (counter < matches.length - 1) {
        this.log('Press Enter to copy the next word...');
        counter++;
      } else {
        return rl.close();
      }
    };

    rl.on('line', next);

    next();
  }
}
