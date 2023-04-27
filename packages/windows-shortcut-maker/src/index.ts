import {spawn, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export interface ShortcutOptions {
  /** the absolute path including the name of which file should the module make a shortcut (required). */
  filepath: string;
  /** create the shortcut even if the original file cannot be found. */
  force?: boolean;
  /** the arguments passed to the original file when the new shortcut is executed. */
  linkArgs?: string;
  /** the absolute path in which folder the original file should start executing. */
  linkCwd?: string;
  /** the description message shown when the cursor stands over the new shortcut without clicking it. */
  linkDescription?: string;
  /** the folder where to save the link (default is the current user's desktop) */
  linkFilepath?: string;
  /** the key combination that is going to trigger the new shortcut execution. (e.g. `'ALT+CTRL+F'`) */
  linkHotkey?: string;
  /** the absolute path to an `.ico` extension image used as the icon for the new shortcut. */
  linkIcon?: string;
  /** the name given for the new shortcut file which obeys the same name rules as a regular file does. */
  linkName?: string;
  /** the initial window mode adopted by the original file when executed. (e.g. `3` is maximized, `4` is normal and `7` is minimized) */
  linkWindowMode?: number;
}

function mergeOptions(options: ShortcutOptions): Required<ShortcutOptions> {
  const rawName = path.basename(options.filepath).replace(/(.*)\..*$/, '$1');
  const defaultOptions = {
    filepath: options.filepath,
    force: false,
    linkArgs: '',
    linkCwd: '',
    linkDescription: rawName,
    linkFilepath: '',
    linkHotkey: '',
    linkIcon: options.filepath,
    linkName: rawName,
    linkWindowMode: 4,
  };
  return {
    ...defaultOptions,
    ...options,
  };
}

function prepare(options: ShortcutOptions | string): Required<ShortcutOptions> {
  if (typeof options === 'string') {
    options = {filepath: options};
  }
  const checkedOptions = mergeOptions(options);

  if (!checkedOptions.force && !fs.existsSync(checkedOptions.filepath)) {
    throw new Error(`Specified file path "${checkedOptions.filepath}" does not exist`);
  }

  if (checkedOptions.linkFilepath && !checkedOptions.force) {
    if (!fs.existsSync(checkedOptions.linkFilepath)) {
      throw new Error(`Specified link file path "${checkedOptions.linkFilepath}" does not exist`);
    }
    if (!fs.lstatSync(checkedOptions.linkFilepath).isDirectory()) {
      throw new Error(`Specified link file path "${checkedOptions.linkFilepath}" is not a directory`);
    }
  }

  return checkedOptions;
}

function buildArgs(options: Required<ShortcutOptions>): readonly string[] {
  const scriptPath = path.join(__dirname, '../scripts/createLink.vbs');
  return [
    scriptPath,
    options.filepath,
    options.linkFilepath,
    options.linkName,
    options.linkArgs,
    options.linkDescription,
    options.linkCwd,
    options.linkIcon,
    options.linkWindowMode.toString(),
    options.linkHotkey,
  ];
}

export function makeSync(options: ShortcutOptions | string): void {
  const checkedOptions = prepare(options);
  spawnSync('wscript', buildArgs(checkedOptions));
}

export function make(options: ShortcutOptions | string): Promise<void> {
  const checkedOptions = prepare(options);
  return new Promise((resolve, reject) => {
    spawn('wscript', buildArgs(checkedOptions))
      .on('error', reject)
      .on('exit', () => resolve());
  });
}
