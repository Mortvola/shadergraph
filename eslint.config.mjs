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
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-empty': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@stylistic/no-trailing-spaces': 'warn',
  }
});
