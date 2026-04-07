'use strict';
/**
 * register-paths.js — Runtime TypeScript path-alias resolver
 *
 * Background
 * ----------
 * `tsc` (the TypeScript compiler used by `nest build`) compiles source files
 * but does NOT transform TypeScript path aliases into relative `require()`
 * calls.  The compiled `dist/` files therefore still contain statements such
 * as `require('@/common/entities/base.entity')`, which Node.js cannot resolve
 * because it looks for a package named `@` in `node_modules/`.
 *
 * Solution
 * --------
 * `tsconfig-paths` patches Node's module resolver to translate the aliases to
 * their real paths at runtime.  This file is loaded before `dist/main` via
 * the `-r` flag:
 *
 *   node -r ./register-paths.js dist/main
 *
 * The `baseUrl` is set to `dist/` so paths map correctly in production.
 * This file itself lives in the project root (same directory as `dist/`).
 */
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
