import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import nock from 'nock';
import {assert, describe, expect, test} from 'vitest';

import {GitHubClient, PullRequest} from './GitHubClient.js';

const TEN_SECONDS_IN_MILLIS = 10_000;
const HALF_SECOND_IN_MILLIS = 500;

describe('GitHubClient', () => {
  describe('getPullRequests', () => {
    test('cancels the request after a given time', async () => {
      nock('https://api.github.com')
        .get(/repos\/.*\/.*\/pulls/)
        .query(true)
        .delay(TEN_SECONDS_IN_MILLIS)
        .reply(HTTP_STATUS.OK);

      const gitHubClient = new GitHubClient(HALF_SECOND_IN_MILLIS);
      try {
        await gitHubClient.getPullRequests('user', 'repository');
        assert.fail('Should not have resolved');
      } catch (error) {
        expect((error as Error).message).toBe('The operation was aborted due to timeout');
      } finally {
        nock.cleanAll();
      }
    });
  });

  describe('getPullRequestsByBranch', () => {
    test('correctly parses pull requests', async () => {
      const exampleData: PullRequest[] = [
        {
          _links: {
            html: {
              href: 'https://github.com/user/repo/pull/1234',
            },
          },
          head: {
            ref: 'branch-name',
          },
        },
      ];

      nock('https://api.github.com')
        .get(/repos\/.*\/.*\/pulls/)
        .query(true)
        .reply(HTTP_STATUS.OK, exampleData);

      const gitHubClient = new GitHubClient();
      const result = await gitHubClient.getPullRequestByBranch('user', 'repository', 'branch-name');
      expect(result).toEqual(exampleData[0]);
    });
  });
});
