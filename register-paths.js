'use strict';
// Registers TypeScript path aliases at runtime for the compiled dist/ output.
// tsc does not transform path aliases in compiled JS, so Node needs help
// resolving imports like require('@/common/...') to the correct dist/ paths.
const path = require('path');
const { register } = require('tsconfig-paths');

register({
  baseUrl: path.join(__dirname, 'dist'),
  paths: {
    '@/*': ['*'],
    '@common/*': ['common/*'],
    '@config/*': ['config/*'],
    '@modules/*': ['modules/*'],
    '@database/*': ['database/*'],
  },
});
