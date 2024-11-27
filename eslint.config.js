import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      'cache',
      'dist',
      'public',
      'packages/valaxy/index.d.ts',
      'packages/valaxy/client.d.ts',
      // generated
      'api/typedoc',
    ],
    rules: {
      'no-dupe-keys': 'warn',
    },
  },
  {
    files: ['**/*.md'],
    rules: {
      'style/no-trailing-spaces': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'regexp/no-super-linear-backtracking': 'warn',
      'regexp/no-unused-capturing-group': 'warn',
      'regexp/no-dupe-disjunctions': 'warn',
      'regexp/optimal-quantifier-concatenation': 'warn',
    },
  },
)
