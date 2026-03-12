---
title: CMS Integration
categories:
  - third
end: false
---

::: warning Experimental

Content Loader is an experimental feature (`@experimental`). The API may change in future releases.

:::

## Introduction

Valaxy supports fetching content from external CMS platforms via **Content Loaders**. Loaders run before Vite starts, writing remote content as `.md` files that integrate automatically into the routing and markdown pipeline.

This means:

- CMS content shares the same features as local `.md` files (routing, search, RSS, etc.)
- No theme or layout modifications needed
- Incremental caching ensures only changed content is rewritten

## How It Works

1. Content Loaders run **before** the Vite dev server or build starts
2. Each loader fetches content from an external CMS, returning `ContentItem[]`
3. Items are written as `.md` files to `.valaxy/content/pages/`
4. These files are automatically picked up by vue-router's file-based routing
5. Existing markdown processing, search indexing, and RSS generation work unchanged

## Defining a Content Loader

Use `defineContentLoader()` to create a Content Loader:

```ts [loaders/my-cms.ts]
import { defineContentLoader } from 'valaxy'

export default defineContentLoader({
  name: 'my-cms',
  async load(ctx) {
    // Fetch content from your CMS API
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
  // Optional: poll every 30s in dev mode
  devPollInterval: 30000,
})
```

## Configuration

Register Content Loaders in `valaxy.config.ts`:

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import myCmsLoader from './loaders/my-cms'

export default defineValaxyConfig({
  loaders: [myCmsLoader],
})
```

### Using with Addons

Some Valaxy addons provide Content Loaders automatically. When using such addons, you don't need to configure `loaders` manually — the addon's `setup()` function injects the loader for you:

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

## API Reference

### ContentItem

Represents a single piece of content fetched from an external source.

### ContentLoaderContext

The context object passed to every loader's `load()` function.

### ContentLoader

The full loader definition interface.

```ts
interface ContentItem {
  /** Route path relative to pages/, e.g. 'posts/my-post.md'. Must end with .md */
  path: string
  /** Full markdown content including YAML frontmatter block */
  content: string
  /** Optional digest for incremental caching (skip write if unchanged) */
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
  /** Polling interval (ms) for dev mode. undefined = no polling */
  devPollInterval?: number
  /** Per-item transform before writing to cache */
  transform?: (item: ContentItem) => ContentItem | Promise<ContentItem>
}
```

## Dev Mode Polling

Set `devPollInterval` (in milliseconds) to have a loader periodically re-fetch content during development. This is useful for near-real-time preview while editing CMS content.

```ts
defineContentLoader({
  name: 'my-cms',
  load: async (ctx) => { /* ... */ },
  devPollInterval: 60000, // Re-fetch every 60 seconds
})
```

::: tip
Polling only runs in dev mode. In build mode, content is fetched once.
:::

## Incremental Caching

Content Loaders use digest-based incremental caching:

- Each item's MD5 digest is recorded in a manifest file
- On subsequent loads, unchanged items are skipped
- Stale files (present in previous manifest but not current output) are automatically removed
- You can provide a custom `digest` on `ContentItem` (e.g. a CMS revision ID)

## Transform

Use `transform` to modify each content item before it is written to disk:

```ts
defineContentLoader({
  name: 'my-cms',
  async load(ctx) { /* ... */ },
  transform(item) {
    // Add a footer to every post
    return {
      ...item,
      content: `${item.content}\n\n---\n\nFetched from My CMS`,
    }
  },
})
```

## Hooks

Content Loaders provide two lifecycle hooks:

| Hook | Description |
| --- | --- |
| `content:before-load` | Fired before all content loaders start fetching |
| `content:loaded` | Fired after all content loaders have finished |

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

## Integration Addons

The following Valaxy addons integrate specific CMS platforms using Content Loaders:

- [valaxy-addon-feishu](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-feishu) — Fetch content from Feishu/Lark documents (`@experimental`)

## References

- [VitePress CMS Guide](https://vitepress.dev/guide/cms) — Similar feature in VitePress
- [GitHub Issue #294](https://github.com/YunYouJun/valaxy/issues/294) — Content Loader design discussion
