import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

import {DirEntry} from './interfaces.js';

const readdirAsync = promisify(fs.readdir);
const lstatAsync = promisify(fs.lstat);

function getBaseIndex(directory: string): {fileIndex: DirEntry; resolvedDir: string} {
  const resolvedDir = path.resolve(directory);

  const fileIndex: DirEntry = {
    directories: {},
    files: {},
    fullPath: `${resolvedDir}${path.sep}`,
    links: {},
    name: path.basename(resolvedDir),
    type: 'directory',
  };

  return {fileIndex, resolvedDir};
}

export async function generateIndex(directory: string, depth = Infinity): Promise<DirEntry> {
  const {fileIndex, resolvedDir} = getBaseIndex(directory);

  depth = depth - 1;

  if (depth <= 0) {
    return fileIndex;
  }

  try {
    const dirObjects = await readdirAsync(resolvedDir);

    const generateIndices = dirObjects.sort().map(async fileName => {
      const resolvedFile = path.join(resolvedDir, fileName);
      const lstat = await lstatAsync(resolvedFile);

      if (lstat.isFile()) {
        fileIndex.files[fileName] = {
          fullPath: resolvedFile,
          name: path.basename(resolvedFile),
          size: lstat.size,
          type: 'file',
        };
      } else if (lstat.isSymbolicLink()) {
        fileIndex.links[fileName] = {
          fullPath: resolvedFile,
          name: path.basename(resolvedFile),
          type: 'link',
        };
      } else if (lstat.isDirectory()) {
        const deepIndex = await generateIndex(resolvedFile, depth);
        fileIndex.directories[fileName] = deepIndex;
      }
    });

    await Promise.all(generateIndices);
  } catch (error) {
    console.error(error);
  }

  return fileIndex;
}

export function generateIndexSync(directory: string, depth = Infinity): DirEntry {
  const {fileIndex, resolvedDir} = getBaseIndex(directory);

  depth = depth - 1;

  if (depth <= 0) {
    return fileIndex;
  }

  try {
    const dirObjects = fs.readdirSync(resolvedDir);

    dirObjects.sort().map(fileName => {
      const resolvedFile = path.join(resolvedDir, fileName);
      const lstat = fs.lstatSync(resolvedFile);

      if (lstat.isFile()) {
        fileIndex.files[fileName] = {
          fullPath: resolvedFile,
          name: path.basename(resolvedFile),
          size: lstat.size,
          type: 'file',
        };
      } else if (lstat.isSymbolicLink()) {
        fileIndex.links[fileName] = {
          fullPath: resolvedFile,
          name: path.basename(resolvedFile),
          type: 'link',
        };
      } else if (lstat.isDirectory()) {
        const deepIndex = generateIndexSync(resolvedFile, depth);
        fileIndex.directories[fileName] = deepIndex;
      }
    });
  } catch (error) {
    console.error(error);
  }

  return fileIndex;
}
