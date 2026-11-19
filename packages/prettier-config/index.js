/** @type {import("prettier").Config} */
const config = {
  arrowParens: 'avoid',
  bracketSpacing: false,
  endOfLine: 'lf',
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
  requirePragma: false,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  useTabs: false,
};

export default config;
