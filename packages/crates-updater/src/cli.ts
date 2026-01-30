#!/usr/bin/env node

import {program as commander} from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';

import * as CratesUpdater from './CratesUpdater.js';

interface PackageJson {
  bin: Record<string, string>;
  description: string;
  version: string;
}

const __dirname = import.meta.dirname;
const packageJsonPath = path.join(__dirname, '../package.json');

const {bin, description, version}: PackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
const [toolName] = Object.keys(bin);

commander
  .name(toolName)
  .description(description)
  .arguments('<package>')
  .arguments('[packageVersion]')
  .option('-q, --quiet', 'quiet mode. Display newer version or nothing')
  .version(version, '-v, --version')
  .parse(process.argv);

if (!commander.args.length) {
  commander.outputHelp();
  process.exit(1);
}

const [packageName, packageVersion] = commander.args;
const commanderOptions = commander.opts();

void (async () => {
  try {
    if (packageVersion) {
      const version = await CratesUpdater.checkForUpdate(packageName, packageVersion);
      if (commanderOptions.quiet) {
        if (version) {
          console.info(version);
        }
      } else {
        const text = version
          ? `An update for ${packageName} is available: ${version}.`
          : `No update for ${packageName} available.`;
        console.info(text);
      }
    } else {
      const version = await CratesUpdater.getLatestVersion(packageName);
      const text = commanderOptions.quiet ? version.num : `Latest ${packageName} version is ${version.num}.`;
      console.info(text);
    }
    process.exit();
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
})();
