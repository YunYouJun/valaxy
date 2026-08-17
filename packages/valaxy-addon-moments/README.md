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
- Optionally reads shared like counts from a configurable HTTP endpoint while keeping only the current browser's liked state in `localStorage`.

The aggregated timeline renders trusted author Markdown as HTML. Vue components, encrypted content, and other transforms that require Vue SFC compilation should remain on normal standalone pages.

## Theme compatibility

The addon owns moment discovery, rendering, styles, and the default `/moments/` page, so its basic list works with any Valaxy theme. `valaxy-theme-yun` adds an enhanced `moments` layout with a sidebar timeline automatically. Other themes can provide their own layout and place `ValaxyMomentsTimeline` where it best fits their design.

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
      likes: {
        enabled: true,
        endpoint: '/api/moments-like',
      },
    }),
  ],
})
```

`initialCount` controls how many moments are rendered on the initial visit, and
`batchSize` controls how many additional moments each **Load more** action
reveals. Both default to `10`. These options only control progressive rendering;
when likes are enabled, public counts are fetched for all moments independently
in batches of up to 100 IDs.

The addon provides `/moments/` automatically. Configure it through
`addonMoments()` for normal use; no `pages/moments/index.md` file is required.

A site may still override the default entry with `pages/moments/index.md` when
it needs entry-page Markdown or page-specific frontmatter. Values under the
page's `moments` field take precedence over matching `addonMoments()` options.

```md
---
title: Moments
description: Small things worth remembering
moments:
  initialCount: 10
  batchSize: 10
  likes:
    enabled: true
    endpoint: /api/moments-like
---
```

Because the addon already supplies the same route, the current route scanner
may print a duplicate-route notice during a build. Valaxy's file priority still
selects the entry from the user directory. Prefer `addonMoments()` when no
custom entry content is needed.

Likes are disabled by default. When enabled, the addon batches public count
requests, updates the button optimistically, and rolls the UI back when the API
fails. The browser writes its local liked state only after a successful update.

### Likes endpoint contract

The endpoint is provider-independent. A successful response must have a 2xx
status and a JSON body matching the following contract.

`GET /api/moments-like?ids=id1,id2` returns a map from every requested moment ID
to its public count:

```json
{
  "id1": 12,
  "id2": 5
}
```

Missing or invalid values in an otherwise valid GET map are displayed as `0`.
Finite counts are floored to integers and negative counts are clamped to `0`.

`POST /api/moments-like` accepts one of these JSON bodies:

```json
{ "momentId": "id1", "action": "like" }
```

```json
{ "momentId": "id1", "action": "unlike" }
```

It returns the updated public count:

```json
{ "count": 13 }
```

The POST `count` must be a finite numeric value. A missing or invalid `count`,
an empty or malformed JSON body (including a `204` response), or any non-2xx
status is treated as a request failure. The client then rolls back the
optimistic update and does not change `localStorage`. A failed GET leaves the
moments page usable without replacing its current counts.

The EdgeOne KV example lives in
[`demo/yun/edge-functions`](../../demo/yun/edge-functions). Other providers may
implement the same contract with their own serverless storage. This lightweight
design does not provide user identity, abuse prevention, or transactionally
exact counters.

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
