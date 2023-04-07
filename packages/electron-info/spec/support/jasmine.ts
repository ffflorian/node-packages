const config: jasmine.JasmineConfig = {
  helpers: ['helpers/**/*.ts'],
  random: true,
  spec_dir: 'spec',
  spec_files: ['**/*test.ts'],
  stopSpecOnExpectationFailure: true,
};

export default config;
