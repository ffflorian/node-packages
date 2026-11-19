import {defineConfig, type OxfmtConfig} from 'oxfmt';

const config: OxfmtConfig = {
  arrowParens: 'avoid',
  bracketSameLine: false,
  bracketSpacing: false,
  endOfLine: 'lf',
  insertFinalNewline: true,
  ignorePatterns: [
    '**/dist/**',
    '**/node_modules/**',
    '**/.yarn/**',
    '**/CHANGELOG.md',
    '**/CLAUDE.md',
    '**/.claude',
    '**/.yarnrc.yml',
  ],
  jsxSingleQuote: false,
  objectWrap: 'preserve',
  overrides: [
    {
      files: ['*.json'],
      options: {
        printWidth: 200,
        trailingComma: 'none',
      },
    },
  ],
  printWidth: 120,
  proseWrap: 'never',
  quoteProps: 'as-needed',
  semi: true,
  singleAttributePerLine: false,
  singleQuote: true,
  sortImports: false,
  sortPackageJson: false,
  tabWidth: 2,
  trailingComma: 'es5',
  useTabs: false,
};

export default defineConfig(config);
