import fs from 'fs-extra';
import path from 'path';

async function checkFile(filePath: string): Promise<void> {
  try {
    await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK);
  } catch (error) {
    throw new Error(`Input file "${filePath} doesn't exist or is not readable.`);
  }
}

export interface packageJson {
  [key: string]: string | packageJson;
}

export async function copyJson(inputFile: string, outputFile: string, values: string[]): Promise<void> {
  if (!values.length) {
    return;
  }

  const inputResolved = path.resolve(inputFile);
  const outputResolved = path.resolve(outputFile);

  await checkFile(inputResolved);
  await fs.ensureFile(outputResolved);

  const originalJSON: packageJson = await fs.readJSON(inputResolved);
  let newJSONRaw = await fs.readFile(outputResolved, 'utf-8');

  let spaces = 2;

  if (!newJSONRaw) {
    console.info('New JSON file has no content.');
    newJSONRaw = '{}';
  } else if (/^\{/.test(newJSONRaw)) {
    const spacesMatch = newJSONRaw.match(/^\{[\n\r]?( *)/);
    if (spacesMatch && spacesMatch[1]) {
      spaces = spacesMatch[1].length;
    }
  }

  const newJSON: packageJson = JSON.parse(newJSONRaw);

  for (const value of values) {
    if (value in originalJSON) {
      newJSON[value] = originalJSON[value];
    }
  }

  await fs.writeJSON(outputResolved, newJSON, {spaces});
}
