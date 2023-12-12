import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'cache',
    'dist',
    'public',
    'packages/valaxy/index.d.ts',
    'packages/valaxy/client.d.ts',
  ],
}, {
  files: ['**/*.md'],
  rules: {
    'style/no-trailing-spaces': 'off',
  },
})
