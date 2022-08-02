# valaxy-addon-statistics

Statistics document information

```ts
import { defineConfig } from 'valaxy'
export default defineConfig({
  addons: [
    'valaxy-addon-statistics'
  ]
})
```

## frontmatter Attributes

```md
<!-- rounded minute stats -->
{{ frontmatter.stats.minutes }}
<!-- exact time in milliseconds -->
{{ frontmatter.stats.time }}
<!-- the word count stats -->
{{ frontmatter.stats.words }}
<!-- total text length -->
{{ frontmatter.stats.length }}
```