// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config({
  extends: [
    {
      ignores: ['dist/', 'build/'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
  ],
  plugins: {
    '@stylistic': stylistic,
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'no-empty': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@stylistic/no-trailing-spaces': 'warn',
    '@stylistic/quotes': ['warn', 'single'],
    '@stylistic/jsx-quotes': ['warn', 'prefer-double'],
    '@stylistic/max-len': ['warn', { code: 120 }],
    '@stylistic/comma-dangle': ['warn', 'always-multiline'],
    // '@stylistic/no-extra-parens': ['warn', 'all', { 'ignoreJSX': 'all' }],
  },
});
