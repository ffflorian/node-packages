/** @type {import("semantic-release").Options} */
const defaultConfig = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            {type: 'feat', section: 'Features'},
            {type: 'fix', section: 'Bug Fixes'},
            {type: 'perf', section: 'Performance Improvements'},
            {type: 'revert', section: 'Reverts'},
            {type: 'refactor', section: 'Code Refactoring'},
            {type: 'docs', section: 'Documentation'},
            {type: 'build', section: 'Build System'},
            {type: 'ci', section: 'Continuous Integration'},
            {type: 'test', section: 'Tests'},
            {type: 'style', section: 'Styles'},
            {type: 'chore', section: 'Miscellaneous Chores'},
          ],
        },
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
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

export {multiPackageConfig, defaultConfig};
export default defaultConfig;
