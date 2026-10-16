import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import nock from 'nock';
import {setTimeout} from 'node:timers/promises';
import {afterEach, beforeEach, describe, expect, test} from 'vitest';

import {HTTPService} from './HTTPService.js';

const mockUrl = 'http://example.com';
const FIVE_SECONDS_IN_MILLIS = 5000;
const HALF_SECOND_IN_MILLIS = 500;

describe('HTTPService', () => {
  const httpService = new HTTPService({
    debug: false,
    timeout: HALF_SECOND_IN_MILLIS,
  });

  beforeEach(() => {
    nock(mockUrl)
      .get('/')
      .reply(async () => {
        await setTimeout(FIVE_SECONDS_IN_MILLIS);
        return [HTTP_STATUS.OK, [{data: 'invalid'}]];
      });
  });

  afterEach(() => nock.cleanAll());

  describe('downloadReleasesFile', () => {
    test('honors a custom timeout', async () => {
      await expect(httpService.downloadReleasesFile(mockUrl, '')).rejects.toThrowError();
    });
  });
});
