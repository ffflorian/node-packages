/** @type {import("semantic-release").Options} */
const defaultConfig = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
        preset: 'angular',
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            {section: 'Features', type: 'feat'},
            {section: 'Bug Fixes', type: 'fix'},
            {section: 'Performance Improvements', type: 'perf'},
            {section: 'Reverts', type: 'revert'},
            {section: 'Code Refactoring', type: 'refactor'},
            {section: 'Documentation', type: 'docs'},
            {section: 'Build System', type: 'build'},
            {section: 'Continuous Integration', type: 'ci'},
            {section: 'Tests', type: 'test'},
            {section: 'Styles', type: 'style'},
            {section: 'Miscellaneous Chores', type: 'chore'},
          ],
        },
      },
    ],
    '@semantic-release/changelog',
    '@semantic-release/npm',
    [
      '@semantic-release/github',
      {
        releasedLabels: false,
        successCommentCondition: false,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};

/** @type {import("semantic-release").Options} */
const multiPackageConfig = {
  ...defaultConfig,
  plugins: [
    ...defaultConfig.plugins.filter(plugin => !Array.isArray(plugin) || plugin[0] !== '@semantic-release/git'),
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.name} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};

export {defaultConfig, multiPackageConfig};
export default defaultConfig;
