---
title: CMS 集成
categories:
  - third
end: false
---

::: warning 实验性功能

Content Loader 是一个实验性功能（`@experimental`），API 可能会在后续版本中发生变化。

:::

## 介绍

Valaxy 支持通过 **Content Loader** 从外部 CMS 平台获取内容。Content Loader 在 Vite 启动之前运行，将远程内容写入 `.md` 文件，并自动集成到路由和 Markdown 处理管道中。

这意味着：

- 来自 CMS 的内容与本地 `.md` 文件享有相同的功能（路由、搜索、RSS 等）
- 无需修改主题或布局
- 支持增量缓存，只更新变化的内容

## 工作原理

1. Content Loader 在 Vite 服务器/构建启动 **之前** 运行
2. 每个 Loader 从外部 CMS 获取内容，返回 `ContentItem[]`
3. 内容被写入 `.valaxy/content/pages/` 目录下的 `.md` 文件
4. 这些文件被 vue-router 的文件路由系统自动发现
5. 现有的 Markdown 处理、搜索索引和 RSS 生成等功能无需修改即可工作

## 定义 Content Loader

使用 `defineContentLoader()` 创建一个 Content Loader：

```ts [loaders/my-cms.ts]
import { defineContentLoader } from 'valaxy'

export default defineContentLoader({
  name: 'my-cms',
  async load(ctx) {
    // 从 CMS API 获取内容
    const response = await fetch('https://api.my-cms.com/posts')
    const posts = await response.json()

    return posts.map(post => ({
      path: `posts/${post.slug}.md`,
      content: [
        '---',
        `title: ${post.title}`,
        `date: ${post.publishedAt}`,
        '---',
        '',
        post.body,
      ].join('\n'),
    }))
  },
  // 可选：开发模式下每 30 秒轮询一次
  devPollInterval: 30000,
})
```

## 配置

在 `valaxy.config.ts` 中注册 Content Loader：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import myCmsLoader from './loaders/my-cms'

export default defineValaxyConfig({
  loaders: [myCmsLoader],
})
```

### 通过插件使用

部分 Valaxy 插件会自动提供 Content Loader。使用这类插件时，无需手动配置 `loaders` —— 插件的 `setup()` 函数会自动注入 Loader：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonFeishu } from 'valaxy-addon-feishu'

export default defineValaxyConfig({
  addons: [
    addonFeishu({
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,
      spaceId: 'your-wiki-space-id',
    }),
  ],
})
```

## API 参考

### ContentItem

表示一个从外部来源获取的内容项。

### ContentLoaderContext

传递给 `load()` 函数的上下文对象。

### ContentLoader

完整的 Loader 定义接口。

```ts
interface ContentItem {
  /** 相对于 pages/ 的路由路径，例如 'posts/my-post.md'。必须以 .md 结尾 */
  path: string
  /** 完整的 markdown 内容，包含 YAML frontmatter */
  content: string
  /** 可选的摘要值，用于增量缓存（未变化则跳过写入） */
  digest?: string
}

interface ContentLoaderContext {
  node: ValaxyNode
  /** .valaxy/content/ */
  cacheDir: string
  mode: 'dev' | 'build'
}

interface ContentLoader {
  name: string
  load: (ctx: ContentLoaderContext) => Promise<ContentItem[]> | ContentItem[]
  /** 开发模式轮询间隔（毫秒），undefined 表示不轮询 */
  devPollInterval?: number
  /** 写入缓存前的逐项转换 */
  transform?: (item: ContentItem) => ContentItem | Promise<ContentItem>
  cleanup?: () => Promise<void> | void
}
```

## 开发模式轮询

设置 `devPollInterval`（毫秒）后，Loader 会在开发模式下定期重新获取内容。这对于在编辑 CMS 内容时实现近实时预览非常有用。

```ts
defineContentLoader({
  name: 'my-cms',
  load: async (ctx) => { /* ... */ },
  devPollInterval: 60000, // 每 60 秒重新获取
})
```

::: tip
轮询仅在开发模式下生效。构建模式下只会获取一次内容。
:::

## 增量缓存

Content Loader 使用基于 digest 的增量缓存机制：

- 每个内容项的 MD5 摘要被记录在 manifest 文件中
- 下次加载时，如果摘要未变化，则跳过写入
- 不再存在于 Loader 输出中的旧文件会被自动清理
- 你也可以在 `ContentItem` 中提供自定义 `digest`（例如使用 CMS 的 revision ID）

## Transform

使用 `transform` 在写入文件之前对每个内容项进行转换：

```ts
defineContentLoader({
  name: 'my-cms',
  async load(ctx) { /* ... */ },
  transform(item) {
    // 为每篇文章添加页脚
    return {
      ...item,
      content: `${item.content}\n\n---\n\nFetched from My CMS`,
    }
  },
})
```

## Hooks

Content Loader 提供了两个生命周期钩子：

| Hook | 描述 |
| --- | --- |
| `content:before-load` | 在所有 Content Loader 开始获取之前触发 |
| `content:loaded` | 在所有 Content Loader 完成之后触发 |

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  hooks: {
    'content:before-load': () => {
      console.log('Content loading started...')
    },
    'content:loaded': () => {
      console.log('Content loading finished!')
    },
  },
})
```

## 集成插件

以下 Valaxy 插件使用 Content Loader 集成了具体的 CMS 平台：

- [valaxy-addon-feishu](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-feishu) — 从飞书/Lark 文档获取内容（`@experimental`）

## 参考

- [VitePress CMS 指南](https://vitepress.dev/guide/cms) — VitePress 的类似功能
- [GitHub Issue #294](https://github.com/YunYouJun/valaxy/issues/294) — Content Loader 的设计讨论
