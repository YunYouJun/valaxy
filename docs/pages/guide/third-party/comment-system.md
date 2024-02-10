---
title: Third Comment System
title_zh: 第三方评论系统
categories:
  - third
---

存在许多第三方评论系统，下面简要介绍下各评论系统集成方式。

> [第三方评论系统之我见](https://www.yunyoujun.cn/posts/third-party-comment-system)

## Waline

> [Waline](https://waline.js.org/) 是一个依赖服务端实现的评论系统，它可以托管在 Vercel 等平台上。

使用 [valaxy-addon-waline](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-addon-waline/README.md) 集成。

> valaxy-addon-waline 是基于 Waline 的一个 Valaxy 插件。

### 安装

```bash
npm i valaxy-addon-waline
# pnpm add valaxy-addon-waline
```

```ts
// valaxy.config.ts
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

export default defineValaxyConfig({
  // or write it in site.config.ts
  siteConfig: {
    // 启用评论
    comment: {
      enable: true
    },
  },
  // 设置 valaxy-addon-waline 配置项
  addons: [
    addonWaline({
      // Waline 配置项，参考 https://waline.js.org/reference/client/props.html
      serverURL: 'https://your-waline-url',
    }),
  ],
})
```

## Utterances

> [Utterances](https://utteranc.es/) 是一个基于 GitHub Issues 实现的评论系统。

它可以直接通过挂载 JS 脚本集成。

在博客根目录下新建 `App.vue`，添加挂载脚本:

```vue
<script lang="ts" setup>
// do script
import { onMounted } from 'vue'

onMounted(() => {
  const utterScript = document.createElement('script')

  utterScript.src = 'https://utteranc.es/client.js'
  utterScript.async = true
  utterScript.crossOrigin = 'anonymous'

  utterScript.setAttribute('repo', 'YunYouJun/valaxy')
  utterScript.setAttribute('issue-term', 'pathname')
  utterScript.setAttribute('label', 'utterances')
  utterScript.setAttribute('theme', 'github-light')

  // 挂载至 .comment，你也可以通过修改 selector 挂载至其他地方
  const commentContainer = document.querySelector('.comment')
  if (commentContainer)
    commentContainer.appendChild(utterScript)
})
</script>

<template>
  <!-- try it -->
  <div />
</template>
```
