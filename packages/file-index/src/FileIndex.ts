import fs from 'node:fs';
import path from 'node:path';

import {DirEntry} from './interfaces.js';

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
    const dirObjects = await fs.promises.readdir(resolvedDir);

    const generateIndices = dirObjects.sort().map(async fileName => {
      const resolvedFile = path.join(resolvedDir, fileName);
      const lstat = await fs.promises.lstat(resolvedFile);

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
