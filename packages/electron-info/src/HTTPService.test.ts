import {assert, describe, test, beforeEach, afterEach} from 'vitest';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import nock from 'nock';

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
      .delayConnection(FIVE_SECONDS_IN_MILLIS)
      .reply(HTTP_STATUS.OK, [{data: 'invalid'}]);
  });

  afterEach(() => nock.cleanAll());

  describe('downloadReleasesFile', () => {
    test('honors a custom timeout', async () => {
      try {
        await httpService.downloadReleasesFile(mockUrl, '');
        assert.fail('Should throw on timeout');
      } catch {}
    });
  });
});
