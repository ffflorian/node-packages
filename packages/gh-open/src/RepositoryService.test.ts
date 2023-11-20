import {expect, describe, test} from 'vitest';
import {RepositoryService} from './RepositoryService.js';

describe('RepositoryService', () => {
  const repositoryService = new RepositoryService();

  describe('getFullUrl', () => {
    const normalizedUrl = 'https://github.com/ffflorian/gh-open';

    const testRegex = (str: string) => {
      const match = repositoryService['parser'].fullUrl.exec(str);
      expect(match![0]).toEqual(expect.any(String));
      const replaced = str.replace(repositoryService['parser'].fullUrl, 'https://$1/$2');
      expect(replaced).toBe(normalizedUrl);
    };

    test('converts complete git URLs', () => {
      const gitUrl = 'git@github.com:ffflorian/gh-open.git';
      testRegex(gitUrl);
    });

    test('converts git URLs without a suffix', () => {
      const gitUrl = 'git@github.com:ffflorian/gh-open';
      testRegex(gitUrl);
    });

    test('converts git URLs without a user', () => {
      const gitUrl = 'github.com:ffflorian/gh-open.git';
      testRegex(gitUrl);
    });

    test('converts complete https URLs', () => {
      const gitUrl = 'https://github.com/ffflorian/gh-open.git';
      testRegex(gitUrl);
    });

    test('converts https URLs without suffix', () => {
      const gitUrl = 'https://github.com/ffflorian/gh-open';
      testRegex(gitUrl);
    });

    test('converts https URLs with a username', () => {
      const gitUrl = 'https://git@github.com/ffflorian/gh-open.git';
      testRegex(gitUrl);
    });

    test('converts https URLs with a username and password', () => {
      const gitUrl = 'https://git:password@github.com/ffflorian/gh-open.git';
      testRegex(gitUrl);
    });
  });

  describe('parseGitConfig', () => {
    const rawUrl = 'git@github.com:ffflorian/gh-open.git';

    const testRegex = (str: string) => {
      const match = repositoryService['parser'].rawUrl.exec(str);
      expect(match!.groups!.rawUrl).toBe(rawUrl);
    };

    test('converts a normal git config', () => {
      const gitConfig = `[remote "origin"]
    url = git@github.com:ffflorian/gh-open.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
    remote = origin
    merge = refs/heads/main`;
      testRegex(gitConfig);
    });

    describe('parseGitBranch', () => {
      const testRegex = (str: string, result: string) => {
        const match = repositoryService['parser'].gitBranch.exec(str);
        expect(match!.groups!.branch).toBe(result);
      };

      test('detects the main branch', () => {
        const rawBranch = 'main';
        const gitHead = 'ref: refs/heads/main\n';
        testRegex(gitHead, rawBranch);
      });

      test('detects a branch with a slash', () => {
        const rawBranch = 'fix/regex';
        const gitHead = 'ref: refs/heads/fix/regex\n';
        testRegex(gitHead, rawBranch);
      });
    });
  });
});
