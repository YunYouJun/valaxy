# valaxy-addon-moments

[简体中文](./README.zh-CN.md) | **English**

A Markdown moments timeline addon for [Valaxy](https://valaxy.site). Publish short updates, photos, and everyday notes from the `pages/moments` directory.

## Features

- Write moments in Markdown without a database.
- Add a date, title, location, pin priority, and up to nine images.
- Browse moments by year and month with progressive loading.
- Remove draft routes from production builds.
- Keep hidden moments accessible by direct URL while omitting them from the production timeline.
- Use the built-in timeline with any Valaxy theme.
- Optionally display public like counts.

## Install

```bash
pnpm add valaxy-addon-moments
```

Configure the addon in `valaxy.config.ts`:

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonMoments } from 'valaxy-addon-moments'

export default defineValaxyConfig({
  addons: [
    addonMoments({
      title: 'Moments',
      description: 'Everyday moments worth remembering',
    }),
  ],
})
```

After starting or building the site, visit `/moments/` to view the timeline. You do not need to create an additional `pages/moments/index.md` file.

## Configuration

All options are optional:

| Option | Description | Default |
| --- | --- | --- |
| `title` | Page title | `Moments` |
| `description` | Page description | None |
| `author.name` | Author name displayed on moment cards | Site author name |
| `author.avatar` | Author avatar displayed on moment cards | Site author avatar |
| `initialCount` | Number of moments shown on the first visit | `10` |
| `batchSize` | Number of moments added by each **Load more** action | `10` |
| `likes.enabled` | Whether to display public like buttons and counts | `false` |
| `likes.endpoint` | Likes service endpoint | `/api/moments-like` |

For multilingual sites, `title` and `description` also accept locale maps.

## Create a moment

The Valaxy CLI can create moments with or without a title:

```bash
pnpm valaxy moments sunset
pnpm valaxy moments
```

The first command creates `pages/moments/YYYY-MM-DD-sunset.md`. The second creates `pages/moments/YYYY-MM-DD-1.md`. If the target file already exists, the command increments the number without overwriting the existing file.

Edit the generated file and write the moment below its frontmatter:

```md
---
date: 2026-08-13 18:30
location: Shanghai
images:
  - src: /images/moments/sunset.webp
    alt: Sunset sky
---

A beautiful sunset on the way home from work.
```

You can also create Markdown files directly in `pages/moments`. The `date` field is required.

### Frontmatter fields

| Field | Description |
| --- | --- |
| `date` | Publication date and time. Required. |
| `title` | Optional title displayed above the content. |
| `location` | Location displayed on the moment card. |
| `images` | A list of image URLs or `{ src, alt, width, height }` objects. Only the first nine valid images are displayed. |
| `top` | Pin priority. Larger positive numbers appear first. |
| `draft` | Set to `true` to remove the moment route from production builds. |
| `hide` | Use a truthy value to omit the moment from the production timeline. Its direct URL remains available. |

Moment content supports Valaxy's Markdown rendering and syntax highlighting. Vue components and encrypted content are not rendered inside aggregated moment cards and should be placed on standalone pages.

To enable image zoom, turn on Valaxy's `siteConfig.mediumZoom` option.

## Theme compatibility

The default moments list works with any Valaxy theme. `valaxy-theme-yun` automatically provides an enhanced layout with sidebar timeline navigation. Other themes can provide a custom `moments` layout or use the `ValaxyMomentsTimeline` component where needed.

## Customize the moments page

In most cases, configure the moments page through `addonMoments()`. To add custom Markdown content or page-specific frontmatter, create `pages/moments/index.md`:

```md
---
title: Moments
description: Everyday moments worth remembering
moments:
  initialCount: 20
  batchSize: 10
---

Introduction to the moments page.
```

Options under `moments` in the page frontmatter override matching options passed to `addonMoments()`.

## Likes

Likes are disabled by default. After deploying a compatible likes service, enable it with the following configuration:

```ts
addonMoments({
  likes: {
    enabled: true,
    endpoint: '/api/moments-like',
  },
})
```

Adapt the setup to your hosting platform and storage provider. No backend service is required when public like counts are disabled. The following instructions use EdgeOne KV for storage.

### EdgeOne KV storage

If your Valaxy project is hosted on EdgeOne, you can use [KV Storage](https://console.cloud.tencent.com/edgeone/makers?tab=storage&sub=kv) in EdgeOne Maker:

1. Create a KV namespace. The namespace can use any name.
2. Open **Hosting Project → KV Storage → KV Namespace Management → Bind Namespace**, then set the variable name to `moments_like`.

An EdgeOne KV example is available in [`demo/yun/edge-functions`](../../demo/yun/edge-functions). Add the files to your repository and set `likes.endpoint` in `addonMoments()` to the deployed file path to enable likes.

## License

MIT