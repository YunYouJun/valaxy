# valaxy-addon-moments

[简体中文](./README.zh-CN.md) | **English**

A theme-independent Markdown moments timeline addon for [Valaxy](https://valaxy.site).

## Features

- Publishes entries from `pages/moments/*.md` without a database.
- Supports author, date, title, location, pinning, long-content expansion, and up to nine images.
- Groups entries by year and month with progressive rendering and timeline navigation.
- Deletes draft and hidden moment routes before production route files are generated.
- Uses the site's configured timezone, or UTC when no timezone is configured, so SSG and hydration remain deterministic.
- Uses Valaxy's configured Markdown-it renderer and syntax highlighting for aggregated content.

The aggregated timeline renders trusted author Markdown as HTML. Vue components, encrypted content, and other transforms that require Vue SFC compilation should remain on normal standalone pages.

## Install

```bash
pnpm add valaxy-addon-moments
```

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonMoments } from 'valaxy-addon-moments'

export default defineValaxyConfig({
  addons: [
    addonMoments({
      title: 'Moments',
      description: 'Small things worth remembering',
      initialCount: 10,
      batchSize: 10,
    }),
  ],
})
```

The addon provides `/moments/` automatically. A site may override it with `pages/moments/index.md`:

```md
---
title: Moments
description: Small things worth remembering
moments:
  initialCount: 10
  batchSize: 10
---
```

## Write a moment

Create `pages/moments/2026-08-13-sunset.md`:

```md
---
date: 2026-08-13 18:30
location: Shanghai
images:
  - src: /images/moments/sunset.webp
    alt: Sunset sky
---

A beautiful sky after work.
```

`date` is required. `top` uses a larger-number-first priority. In production, entries with `draft: true` or any truthy `hide` value are removed from the generated route tree.

Image input accepts either strings or `{ src, alt, width, height }` objects. Only the first nine valid images are displayed. To enable image zoom, enable Valaxy's `siteConfig.mediumZoom`; images added by progressive rendering are attached when their card mounts.

## Development

```bash
pnpm --filter valaxy-addon-moments test
pnpm lint
pnpm typecheck
```

## License

MIT
