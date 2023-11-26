#!/usr/bin/env node

import {program as commander} from 'commander';
import fs from 'fs-extra';
import path from 'path';
import {fileURLToPath} from 'url';

import {JSZipCLI} from './JSZipCLI.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultPackageJsonPath = path.join(__dirname, '../../package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const {description, name, version}: {description: string; name: string; version: string} =
  fs.readJSONSync(packageJsonPath);

interface CLIOptions {
  config?: string;
  dereference?: boolean;
  force?: boolean;
  ignore?: string;
  level?: string;
  noconfig?: boolean;
  output?: string;
  quiet?: boolean;
  verbose?: boolean;
}

commander
  .name(name.replace(/^@[^/]+\//, ''))
  .description(description)
  .option('--noconfig', "don't look for a configuration file")
  .option('-c, --config <path>', 'use a configuration file (default: .jsziprc.json)')
  .option('-d, --dereference', 'dereference (follow) links', false)
  .option('-f, --force', 'force overwriting files and directories when extracting', false)
  .option('-i, --ignore <entry>', 'ignore a file or directory')
  .option('-l, --level <number>', 'set the compression level', '5')
  .option('-o, --output <dir>', 'set the output file or directory (default: stdout)')
  .option('-q, --quiet', "don't log anything", false)
  .option('-V, --verbose', 'enable verbose logging', false)
  .version(version, '-v, --version')
  .on('command:*', args => {
    console.error(`\n  error: invalid command \`${args[0]}'\n`);
    process.exit(1);
  });

commander
  .command('add')
  .alias('a')
  .description('add files and directories to a new ZIP archive')
  .option('--noconfig', "don't look for a configuration file")
  .option('-c, --config <path>', 'use a configuration file')
  .option('-d, --dereference', 'dereference (follow) symlinks', false)
  .option('-f, --force', 'force overwriting files and directories when extracting', false)
  .option('-i, --ignore <entry>', 'ignore a file or directory')
  .option('-l, --level <number>', 'set the compression level', '5')
  .option('-o, --output <dir>', 'set the output file or directory (default: stdout)')
  .option('-q, --quiet', "don't log anything excluding errors", false)
  .option('-V, --verbose', 'enable verbose logging', false)
  .arguments('[entries...]')
  .action(async (entries: string[]) => {
    const options = commander.opts() as CLIOptions;
    try {
      const jszip = new JSZipCLI({
        ...(options.level && {compressionLevel: Number(options.level)}),
        ...((options.config && {configFile: options.config}) || (options.noconfig && {configFile: false})),
        ...(options.dereference && {dereferenceLinks: options.dereference}),
        ...(options.force && {force: options.force}),
        ...(options.ignore && {ignoreEntries: [options.ignore]}),
        ...(options.output && {outputEntry: options.output}),
        ...(options.quiet && {quiet: options.quiet}),
        ...(options.verbose && {verbose: options.verbose}),
      });
      jszip.add(entries);
      const {outputFile, compressedFilesCount} = await jszip.save();

      if (options.output && !options.quiet) {
        console.info(`Done compressing ${compressedFilesCount} files to "${outputFile}".`);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

commander
  .command('extract')
  .alias('e')
  .description('extract files and directories from ZIP archive(s)')
  .option('--noconfig', "don't look for a configuration file", false)
  .option('-c, --config <path>', 'use a configuration file (default: .jsziprc.json)')
  .option('-o, --output <dir>', 'set the output file or directory (default: stdout)')
  .option('-i, --ignore <entry>', 'ignore a file or directory')
  .option('-f, --force', 'force overwriting files and directories', false)
  .option('-V, --verbose', 'enable verbose logging', false)
  .option('-q, --quiet', "don't log anything excluding errors", false)
  .arguments('<archives...>')
  .action(async (archives: string[]) => {
    const options = commander.opts() as CLIOptions;
    try {
      const {outputDir, extractedFilesCount} = await new JSZipCLI({
        ...((options.config && {configFile: options.config}) || (options.noconfig && {configFile: false})),
        ...(options.force && {force: options.force}),
        ...(options.ignore && {ignoreEntries: [options.ignore]}),
        ...(options.output && {outputEntry: options.output}),
        ...(options.quiet && {quiet: options.quiet}),
        ...(options.verbose && {verbose: options.verbose}),
      }).extract(archives);

      if (options.output && !options.quiet) {
        console.info(`Done extracting ${extractedFilesCount} files to "${outputDir}".`);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

commander
  .command('fileMode', {hidden: true, isDefault: true})
  .option('--noconfig', "don't look for a configuration file", false)
  .option('-c, --config <path>', 'use a configuration file (default: .jsziprc.json)')
  .option('-o, --output <dir>', 'set the output file or directory (default: stdout)')
  .option('-i, --ignore <entry>', 'ignore a file or directory')
  .option('-f, --force', 'force overwriting files and directories', false)
  .option('-V, --verbose', 'enable verbose logging', false)
  .option('-q, --quiet', "don't log anything excluding errors", false)
  .action(async () => {
    const options = commander.opts() as CLIOptions;

    try {
      if (options.noconfig) {
        commander.outputHelp();
      }

      await new JSZipCLI({
        ...(options.config && {configFile: options.config}),
        ...(options.force && {force: options.force}),
        ...(options.ignore && {ignoreEntries: [options.ignore]}),
        ...(options.output && {outputEntry: options.output}),
        ...(options.quiet && {quiet: options.quiet}),
        ...(options.verbose && {verbose: options.verbose}),
      }).fileMode();
    } catch (error) {
      if ((error as Error).message.includes('ENOENT')) {
        console.error('Error:', `Configuration file "${options.config}" not found and no mode specified.`);
      } else {
        console.error('Error:', (error as Error).message);
      }
      process.exit(1);
    }
  });

commander.parse(process.argv);
