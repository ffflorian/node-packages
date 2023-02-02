#!/usr/bin/env node

import {program as commander} from 'commander';
import fs from 'fs-extra';
import path from 'path';

import {PublishFlat} from './PublishFlat';

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const {bin, description, version} = fs.readJSONSync(packageJsonPath);

commander
  .name(Object.keys(bin)[0])
  .version(version)
  .description(description)
  .option('-y, --yarn', 'Use yarn for publishing (default: false)')
  .option('-f, --flatten <dir>', 'Which directory to flatten', 'dist')
  .option('-o, --output <dir>', 'Set the output directory (default: temp directory)')
  .option('-p, --publish', 'Publish (default: false)')
  .arguments('[dir]')
  .allowUnknownOption()
  .parse(process.argv);

const commanderOptions = commander.opts();

const flatPublisher = new PublishFlat({
  dirToFlatten: commanderOptions.flatten,
  outputDir: commanderOptions.output,
  packageDir: commanderOptions.dir || '.',
  publishArguments: commanderOptions.args,
  useYarn: commanderOptions.yarn || false,
});

void (async () => {
  try {
    const outputDir = await flatPublisher.build();
    if (commanderOptions.publish && outputDir) {
      await flatPublisher.publish(outputDir);
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
