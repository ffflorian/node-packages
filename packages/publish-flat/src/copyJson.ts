import fs from 'node:fs/promises';
import path from 'node:path';

export interface PackageJson {
  [key: string]: PackageJson | string;
}

export async function copyJson(inputFile: string, outputFile: string, values: string[]): Promise<void> {
  if (!values.length) {
    return;
  }

  const inputResolved = path.resolve(inputFile);
  const outputResolved = path.resolve(outputFile);

  await checkFile(inputResolved);

  const originalJSON: PackageJson = JSON.parse(await fs.readFile(inputResolved, 'utf-8'));
  let newJSONRaw = await fs.readFile(outputResolved, 'utf-8');

  let spaces = 2;

  if (!newJSONRaw) {
    console.info('New JSON file has no content.');
    newJSONRaw = '{}';
  } else if (newJSONRaw.startsWith('{')) {
    const spacesMatch = newJSONRaw.match(/^\{[\n\r]?( *)/);
    if (spacesMatch && spacesMatch[1]) {
      spaces = spacesMatch[1].length;
    }
  }

  const newJSON: PackageJson = JSON.parse(newJSONRaw);

  for (const value of values) {
    if (value in originalJSON) {
      newJSON[value] = originalJSON[value];
    }
  }

  await fs.writeFile(outputResolved, JSON.stringify(newJSON, null, spaces));
}

async function checkFile(filePath: string): Promise<void> {
  try {
    await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK);
  } catch {
    throw new Error(`Input file "${filePath} doesn't exist or is not readable.`);
  }
}
