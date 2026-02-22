module.exports = {
  compressionLevel: 9,
  entries: ['dist.zip'],
  force: true,
  ignoreEntries: ['*.map', new RegExp('\\.html?$')],
  mode: 'extract',
  outputEntry: 'dist/',
  quiet: false,
  verbose: false,
};
