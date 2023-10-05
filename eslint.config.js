// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'cache',
    'public',
    'packages/valaxy/index.d.ts',
    'packages/valaxy/client.d.ts',
  ],
})
