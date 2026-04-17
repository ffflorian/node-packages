import JSZip from 'jszip';
import {describe, expect, test} from 'vitest';

import {TEKSignatureList, TemporaryExposureKeyExport} from '../proto/export.js';

import {loadKeys, loadSignature, loadZip, riskCount} from './ExposureKeys.js';

const header = Buffer.from('EK Export v1    ', 'utf-8');

describe('ExposureKeys', () => {
  test('loadKeys rejects zip files', () => {
    const zipHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    expect(() => loadKeys(zipHeader)).toThrow('Please use `loadZip()`');
  });

  test('loadKeys rejects missing header', () => {
    const content = Buffer.concat([Buffer.from('wrong header     '), Buffer.from([1, 2, 3])]);
    expect(() => loadKeys(content)).toThrow('missing a correct header');
  });

  test('loadKeys decodes key export payload', () => {
    const encoded = TemporaryExposureKeyExport.encode({
      keys: [{transmissionRiskLevel: 3}, {transmissionRiskLevel: 2}],
    }).finish();
    const content = Buffer.concat([header, Buffer.from(encoded)]);

    const result = loadKeys(content);

    expect(result.keys).toHaveLength(2);
    expect(result.keys[0].transmissionRiskLevel).toBe(3);
  });

  test('loadSignature decodes signature payload', () => {
    const encoded = TEKSignatureList.encode({
      signatures: [{batchNum: 1, batchSize: 2, signature: Buffer.from([1, 2])}],
    }).finish();

    const result = loadSignature(Buffer.from(encoded));

    expect(result.signatures).toHaveLength(1);
    expect(result.signatures[0].batchNum).toBe(1);
  });

  test('loadZip extracts export and signature files', async () => {
    const zip = new JSZip();
    zip.file('export.bin', Buffer.from('key-data'));
    zip.file('export.sig', Buffer.from('sig-data'));
    const content = Buffer.from(await zip.generateAsync({type: 'nodebuffer'}));

    const result = await loadZip(content);

    expect(result.keys.toString()).toBe('key-data');
    expect(result.signature.toString()).toBe('sig-data');
  });

  test('riskCount returns number of matching transmission levels', () => {
    const exportData = TemporaryExposureKeyExport.fromObject({
      keys: [{transmissionRiskLevel: 1}, {transmissionRiskLevel: 2}, {transmissionRiskLevel: 2}],
    });

    expect(riskCount(exportData, 2)).toBe(2);
  });
});
