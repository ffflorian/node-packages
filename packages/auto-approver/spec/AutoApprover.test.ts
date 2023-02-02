import * as nock from 'nock';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

import {AutoApprover, Repository} from '../src/AutoApprover';

describe('AutoApprover', () => {
  describe('checkRepository', () => {
    let autoApprover: AutoApprover;
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
            number: 253,
            title: 'chore: bump eslint-plugin-typescript-sort-keys from 1.3.0 to 1.5.0',
          },
        ],
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
            number: 252,
            title: 'chore: bump typescript from 4.0.2 to 4.0.3',
          },
        ],
        repositorySlug: validRepositoryNames[1],
      },
    ];

    beforeEach(() => {
      autoApprover = new AutoApprover({
        authToken: 'example-token',
        projects: {
          gitHub: validRepositoryNames,
        },
      });

      nock(autoApprover['apiClient'].defaults.baseURL!)
        .post(/^\/repos\/[^/]+\/[^/]+\/pulls\/\d+\/reviews\/?$/)
        .reply(HTTP_STATUS.OK, {data: 'not-used'})
        .persist();

      nock(autoApprover['apiClient'].defaults.baseURL!)
        .post(/^\/repos\/[^/]+\/[^/]+\/issues\/\d+\/comments\/?$/)
        .reply(HTTP_STATUS.CREATED, {data: 'not-used'})
        .persist();
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('detects valid repository names', () => {
      validRepositoryNames.forEach(repositoryName => {
        const checkResult = autoApprover['checkRepositorySlug'](repositoryName);
        expect(checkResult).toBeTrue();
      });
    });

    it('detects invalid repository names', () => {
      const invalidRepositoryNames = [
        'invalid-username--/valid-project-name',
        'valid-username/invalid-project-name-',
        'no-project-name',
        'in(valid-username/valid-project-name',
        'valid-username/invalid!project-name',
      ];
      invalidRepositoryNames.forEach(repositoryName => {
        const checkResult = autoApprover['checkRepositorySlug'](repositoryName);
        expect(checkResult).toBeFalse();
      });
    });

    describe('getMatchingRepositories', () => {
      it('matches repositories', () => {
        const expectedESLint = [repositories[0]];
        const actualESLint = autoApprover['getMatchingRepositories'](repositories, /eslint/gi);
        expect(actualESLint).toEqual(expectedESLint);

        const expectedTypeScript = [repositories[1]];
        const actualTypeScript = autoApprover['getMatchingRepositories'](repositories, /typescript-4.0.3/gi);
        expect(actualTypeScript).toEqual(expectedTypeScript);

        const expectedAll = repositories;
        const actualAll = autoApprover['getMatchingRepositories'](repositories, /typescript/gi);
        expect(actualAll).toEqual(expectedAll);

        const expectedNone: Repository[] = [];
        const actualNone = autoApprover['getMatchingRepositories'](repositories, /no-match/gi);
        expect(actualNone).toEqual(expectedNone);
      });
    });

    describe('commentByMatch', () => {
      it('comments on matching PRs', async () => {
        spyOn<any>(autoApprover, 'postComment').and.callThrough();
        const comment = '@dependabot squash and merge';

        await autoApprover.commentByMatch(/eslint/gi, comment, repositories);
        const expectedRepositoryESLint = repositories[0];
        expect(autoApprover['postComment']).toHaveBeenCalledWith(
          expectedRepositoryESLint.repositorySlug,
          expectedRepositoryESLint.pullRequests[0].number,
          comment
        );

        await autoApprover.commentByMatch(/typescript-4.0.3/gi, comment, repositories);
        const expectedRepositoryTypescript = repositories[1];
        expect(autoApprover['postComment']).toHaveBeenCalledWith(
          expectedRepositoryTypescript.repositorySlug,
          expectedRepositoryTypescript.pullRequests[0].number,
          comment
        );
      });
    });
  });
});
