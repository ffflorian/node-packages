import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import nock from 'nock';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';

import type {GitHubPullRequest, Repository} from './types/index.js';

import {AutoMerge} from './AutoMerge.js';

describe('AutoMerge', () => {
  describe('checkRepository', () => {
    let autoMerge: AutoMerge;

    const validRepositoryNames = ['ffflorian/example-project-1', 'my-name/my_great-project42342'];
    const repositories: Repository[] = [
      {
        pullRequests: [
          {
            draft: false,
            head: {
              ref: 'dependabot/npm_and_yarn/eslint-plugin-typescript-sort-keys-1.5.0',
              sha: 'cd3ae10104a2ed9d937869b892457003ad68df74',
            },
            mergeable_state: 'clean',
            number: 253,
            title: 'chore: bump eslint-plugin-typescript-sort-keys from 1.3.0 to 1.5.0',
          },
        ] as GitHubPullRequest[],
        repositorySlug: validRepositoryNames[0],
      },
      {
        pullRequests: [
          {
            draft: false,
            head: {
              ref: 'dependabot/npm_and_yarn/typescript-4.0.3',
              sha: 'e59a374b357763fab5d3e61b0fdab66f4746b097',
            },
            mergeable_state: 'clean',
            number: 252,
            title: 'chore: bump typescript from 4.0.2 to 4.0.3',
          },
        ] as GitHubPullRequest[],
        repositorySlug: validRepositoryNames[1],
      },
    ];

    beforeEach(() => {
      autoMerge = new AutoMerge({
        authToken: 'example-token',
        projects: {
          gitHub: validRepositoryNames,
        },
      });

      nock(autoMerge['baseURL']!)
        .post(/^\/repos\/.+?\/.+?\/pulls\/\d+(\/reviews)?\/?$/)
        .reply(HTTP_STATUS.OK, {data: 'not-used'})
        .persist();

      nock(autoMerge['baseURL']!)
        .put(/^\/repos\/.+?\/.+?\/pulls\/\d+(\/merge)?\/?$/)
        .reply(HTTP_STATUS.OK, {data: 'not-used'})
        .persist();

      nock(autoMerge['baseURL']!)
        .get(/^\/repos\/.+?\/.+?\/pulls\/\d+\/?$/)
        .reply(HTTP_STATUS.OK, {mergeable_state: 'clean'})
        .persist();
    });

    afterEach(() => {
      nock.cleanAll();
    });

    test('detects valid repository names', () => {
      validRepositoryNames.forEach(repositoryName => {
        const checkResult = autoMerge['checkRepositorySlug'](repositoryName);
        expect(checkResult).toBe(true);
      });
    });

    test('detects invalid repository names', () => {
      const invalidRepositoryNames = [
        'invalid-username--/valid-project-name',
        'valid-username/invalid-project-name-',
        'no-project-name',
        'in(valid-username/valid-project-name',
        'valid-username/invalid!project-name',
      ];
      invalidRepositoryNames.forEach(repositoryName => {
        const checkResult = autoMerge['checkRepositorySlug'](repositoryName);
        expect(checkResult).toBe(false);
      });
    });

    describe('getMatchingRepositories', () => {
      test('matches repositories', () => {
        const expectedESLint = [repositories[0]];
        const actualESLint = autoMerge['getMatchingRepositories'](repositories, /eslint/gi);
        expect(actualESLint).toEqual(expectedESLint);

        const expectedTypeScript = [repositories[1]];
        const actualTypeScript = autoMerge['getMatchingRepositories'](repositories, /typescript-4.0.3/gi);
        expect(actualTypeScript).toEqual(expectedTypeScript);

        const expectedAll = repositories;
        const actualAll = autoMerge['getMatchingRepositories'](repositories, /typescript/gi);
        expect(actualAll).toEqual(expectedAll);

        const expectedNone: Repository[] = [];
        const actualNone = autoMerge['getMatchingRepositories'](repositories, /no-match/gi);
        expect(actualNone).toEqual(expectedNone);
      });
    });

    describe('mergeByMatch', () => {
      test('merge matching PRs', async () => {
        vi.spyOn<any, any>(autoMerge, 'putMerge');

        await autoMerge.mergeByMatch(/eslint/gi, repositories);
        const expectedRepositoryESLint = repositories[0];
        expect(autoMerge['putMerge']).toHaveBeenCalledWith(
          expectedRepositoryESLint.repositorySlug,
          expectedRepositoryESLint.pullRequests[0].number,
          false
        );

        await autoMerge.mergeByMatch(/typescript-4.0.3/gi, repositories);
        const expectedRepositoryTypescript = repositories[1];
        expect(autoMerge['putMerge']).toHaveBeenCalledWith(
          expectedRepositoryTypescript.repositorySlug,
          expectedRepositoryTypescript.pullRequests[0].number,
          false
        );
      });
    });
  });
});
