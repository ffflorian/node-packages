import {type CosmiconfigResult, cosmiconfigSync} from 'cosmiconfig';
import logdown from 'logdown';

import type {ConfigFile} from './interfaces.js';

const logger = logdown('webhook-forwarder/config', {
  logger: console,
  markdown: false,
});

export function loadConfig(configPath?: string): ConfigFile | undefined {
  const explorer = cosmiconfigSync('webhook-forwarder');
  let result: CosmiconfigResult = null;

  if (configPath) {
    try {
      result = explorer.load(configPath);
    } catch (error) {
      throw new Error(`Cannot read configuration file: ${(error as Error).message}`, {cause: error});
    }
  } else {
    try {
      result = explorer.search();
    } catch (error) {
      logger.error(error);
    }
  }

  if (!result || result.isEmpty) {
    return undefined;
  }

  logger.info(`Using configuration file ${result.filepath}`);
  return result.config as ConfigFile;
}
