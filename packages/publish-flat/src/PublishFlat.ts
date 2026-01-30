import Arborist from '@npmcli/arborist';
import logdown from 'logdown';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import packlist from 'npm-packlist';

export interface PublishOptions {
  /** Which directory to flatten (e.g. to move dist/main.js => main.js, use `dist`) */
  dirToFlatten: string;
  outputDir?: string;
  packageDir: string;
  /** Arguments to forward to npm or yarn */
  publishArguments?: string[];
  /** Use yarn for publishing */
  useYarn?: boolean;
}

interface Categorized {
  filesInFlattenedDir: FilesInFlattenedDir;
  normalFiles: string[];
}

type FilesInFlattenedDir = Array<{fileName: string; replacedFilename: string}>;

interface PackageJson {
  bin: Record<string, string> | string;
  files: string[];
  main?: string;
}

export class PublishFlat {
  private readonly dirToFlatten: string;
  private readonly dirToFlattenRegex: RegExp;
  private readonly logger: logdown.Logger;
  private readonly options: PublishOptions;
  private readonly packageDir: string;

  constructor(options: PublishOptions) {
    this.options = options;
    this.logger = logdown('publish-flat', {
      logger: console,
      markdown: false,
    });
    this.logger.state.isEnabled = true;

    this.packageDir = path.resolve(this.options.packageDir);
    this.dirToFlatten = this.cleanDirName(this.options.dirToFlatten);
    const escapedDirToFlatten = this.dirToFlatten.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    this.dirToFlattenRegex = new RegExp(`${escapedDirToFlatten}[\\/]`);
  }

  async build(): Promise<string | void> {
    const arborist = new Arborist({path: this.packageDir});
    const tree = await arborist.loadActual();
    const files = await packlist(tree);

    if (!files.length) {
      this.logger.info('No files to publish');
      return;
    }

    if (!files.includes('package.json')) {
      throw new Error(`Files don't include a "package.json" file`);
    }

    const {filesInFlattenedDir, normalFiles} = files.reduce(
      (result: Categorized, fileName: string) => {
        if (this.dirToFlattenRegex.test(fileName)) {
          const replacedFilename = fileName.replace(this.dirToFlattenRegex, '');
          result.filesInFlattenedDir.push({fileName, replacedFilename});
        } else {
          result.normalFiles.push(fileName);
        }
        return result;
      },
      {filesInFlattenedDir: [], normalFiles: []}
    );

    const outputDir = this.options.outputDir ? path.resolve(this.options.outputDir) : await this.createTempDir();

    for (const file of normalFiles) {
      await fs.cp(path.join(this.packageDir, file), path.join(outputDir, file));
    }

    for (const {fileName, replacedFilename} of filesInFlattenedDir) {
      await fs.cp(path.join(this.packageDir, fileName), path.join(outputDir, replacedFilename));
    }

    this.logger.info(`Flattened ${files.length} files in "${outputDir}".`);

    await this.cleanPackageJson(path.join(outputDir, 'package.json'), filesInFlattenedDir);

    return outputDir;
  }

  async publish(tempDir: string): Promise<void> {
    this.logger.info(`Publishing "${this.packageDir}" ...`);

    const executor = this.options.useYarn ? 'yarn' : 'npm';
    const args = ['publish', `"${tempDir}"`].concat(this.options.publishArguments || []);

    this.logger.info(`Running "${executor} ${args.join(' ')}" ...`);

    const stdout = execFileSync(executor, args).toString().trim();

    if (stdout) {
      this.logger.info(stdout);
    }

    await fs.rm(tempDir, {force: true, recursive: true});
  }

  private cleanDirName(dirName: string): string {
    const separatorRegex = new RegExp('[\\/]*([^\\/]+)[\\/]*', 'g');
    const cleanName = dirName.trim().replace(separatorRegex, '$1');
    if (!cleanName) {
      throw new Error(`Invalid flatten dir "${dirName}" specified`);
    }
    return cleanName;
  }

  private async cleanPackageJson(filePath: string, filesInFlattenedDir: FilesInFlattenedDir): Promise<void> {
    const packageJson: PackageJson = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    if (Array.isArray(packageJson.files)) {
      packageJson.files = packageJson.files
        .map(fileName => fileName.replace(this.dirToFlattenRegex, ''))
        .concat(filesInFlattenedDir.map(({replacedFilename}) => replacedFilename))
        .filter(fileName => fileName !== this.dirToFlatten)
        .sort();
    }

    if (typeof packageJson.bin === 'string') {
      packageJson.bin = packageJson.bin.replace(this.dirToFlattenRegex, '');
    } else if (typeof packageJson.bin === 'object') {
      for (const binName in packageJson.bin) {
        packageJson.bin[binName] = packageJson.bin[binName].replace(this.dirToFlattenRegex, '');
      }
    }

    if (packageJson.main) {
      packageJson.main = packageJson.main.replace(this.dirToFlattenRegex, '');
    }

    const packageJsonString = `${JSON.stringify(packageJson, null, 2)}\n`;
    await fs.writeFile(filePath, packageJsonString, 'utf-8');
  }

  private createTempDir(): Promise<string> {
    return fs.mkdtemp(path.join(os.tmpdir(), 'publish-flat-'));
  }
}
