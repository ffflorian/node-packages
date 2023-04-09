import {loadAsync} from 'jszip';
import {TemporaryExposureKeyExport, TEKSignatureList} from '../proto/export.js';

function isZip(fileContent: Buffer): boolean {
  // eslint-disable-next-line no-magic-numbers
  const zipHeader = [0x50, 0x4b];
  return Buffer.from(zipHeader).compare(fileContent, 0, 2) === 0;
}

export async function loadZip(fileContent: Buffer): Promise<{keys: Buffer; signature: Buffer}> {
  if (!isZip(fileContent)) {
    throw new Error('The file you are trying to load is not a zip file.');
  }

  const unzippedData = await loadAsync(fileContent);
  const keyData = await unzippedData.file('export.bin')?.async('nodebuffer');
  const signatureData = await unzippedData.file('export.sig')?.async('nodebuffer');

  if (!keyData) {
    throw new Error(`The zip file doesn't contain key data`);
  }

  if (!signatureData) {
    throw new Error(`The zip file doesn't contain a signature`);
  }

  return {keys: keyData, signature: signatureData};
}

export function loadKeys(fileContent: Buffer): TemporaryExposureKeyExport {
  if (isZip(fileContent)) {
    throw new Error('You are trying to load a zip file. Please use `loadZip()` for that');
  }

  const wantedHeader = 'EK Export v1    ';
  const header = fileContent.slice(0, wantedHeader.length);
  const key = fileContent.slice(wantedHeader.length);

  if (header.toString('utf-8') !== wantedHeader) {
    throw new Error('The key is missing a correct header');
  }

  return TemporaryExposureKeyExport.decode(key);
}

export function loadSignature(fileContent: Buffer): TEKSignatureList {
  return TEKSignatureList.decode(fileContent);
}

export function riskCount(
  temporaryExposureKeyExport: TemporaryExposureKeyExport,
  transmissionRiskLevel: number
): number {
  return temporaryExposureKeyExport.keys.filter(
    key => key.transmissionRiskLevel && key.transmissionRiskLevel === transmissionRiskLevel
  ).length;
}
