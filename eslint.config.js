import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      'cache',
      'dist',
      'public',
      'packages/valaxy/index.d.ts',
      // generated
      'api/typedoc',
    ],
    rules: {
      'no-dupe-keys': 'off',
      'e18e/prefer-static-regex': 'off',
    },
  },
  {
    files: ['**/*.md'],
    rules: {
      'style/no-trailing-spaces': 'off',
    },
  },
  {
    files: [
      'demo/**/pages/**/*.md',
      'docs/pages/**/*.md',
      'packages/create-valaxy/template-blog/pages/**/*.md',
      'packages/valaxy-theme-yun/docs/**/*.md',
      'api/**/*.md',
    ],
    rules: {
      // Valaxy markdown files use YAML frontmatter with `#` comments
      // that ESLint incorrectly interprets as H1 headings
      'markdown/no-multiple-h1': 'off',
      // Valaxy uses `{lang="..."}` heading attributes that affect anchor IDs
      // in ways the ESLint rule doesn't understand
      'markdown/no-missing-link-fragments': 'off',
      // Demo/test files may contain intentional empty images for testing
      'markdown/no-empty-images': 'off',
      // Content files may intentionally omit alt text for testing purposes
      'markdown/require-alt-text': 'off',
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
  {
    files: ['packages/create-valaxy/**/*'],
    rules: {
      'pnpm/json-enforce-catalog': 'off',
    },
  },
)
