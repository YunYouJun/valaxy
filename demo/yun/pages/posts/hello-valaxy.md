---
title: Hello, Valaxy!
date: 2022-03-22
---

{{frontmatter.date}}

构想新一代静态博客框架/生成器。

```ts
import type { UserConfig } from 'valaxy'
import type { ThemeUserConfig } from 'valaxy-theme-yun'

/**
 * User Config
 * do not use export const, because c12 will set as child property
 */
const config: UserConfig<ThemeUserConfig> = {
  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
    },
  },
}

export default config
```

配置、文章热更新

而不是像 hexo 一样重新加载页面
