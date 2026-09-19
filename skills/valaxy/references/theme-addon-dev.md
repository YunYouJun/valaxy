# Theme & Addon Development Reference

## Table of Contents

- [Theme Development](#theme-development)
- [Addon Development](#addon-development)
- [Post Frontmatter Reference](#post-frontmatter-reference)
- [User Site Directory Structure](#user-site-directory-structure)
- [Available Addons](#available-addons)

## Theme Development

### File Structure

```txt
valaxy-theme-{name}/
├── client/index.ts        # Client exports (useThemeConfig, etc.)
├── node/index.ts           # Node exports (defineTheme)
├── components/             # Auto-imported Vue components
│   └── ValaxyMain.vue      # Required: wraps post rendering
├── composables/
│   └── config.ts           # useThemeConfig(), useThemeColorVars()
├── layouts/                # Vue layouts
│   ├── default.vue
│   ├── home.vue
│   ├── post.vue            # Auto-assigned for pages/posts/**
│   └── tags.vue
├── locales/
│   ├── en.yml
│   └── zh-CN.yml
├── styles/index.scss       # Theme styles
├── setup/main.ts           # defineAppSetup() for Vue plugins, styles
├── types/index.d.ts        # TypeScript types
├── App.vue                 # Theme app entry
├── valaxy.config.ts        # defineTheme() export
└── index.ts                # Package entry
```

### Key APIs

**`defineTheme()` — node-side config:**

```ts
// valaxy.config.ts
import { defineTheme } from 'valaxy'

export default defineTheme({
  themeConfig: {
    // Default theme config values
    banner: { enable: true, title: '' },
    colors: { primary: '#0078e7' },
  },
  vite: {
    // Vite config extensions
  },
  unocss: {
    // UnoCSS safelist/presets
  },
})
```

**`defineAppSetup()` — client-side setup:**

```ts
// setup/main.ts
import { defineAppSetup } from 'valaxy'
import '../styles/index.scss'

export default defineAppSetup(({ app, router, head, isClient }) => {
  // Register Vue plugins, global components, etc.
})
```

**`useThemeConfig()` — access theme config at runtime:**

```ts
import { useThemeConfig } from '../composables/config'

const themeConfig = useThemeConfig()
```

### Required Components

- `ValaxyMain.vue` — Every theme MUST provide this component. It wraps the main content rendering area.

### Layout Auto-Assignment

Layouts are auto-assigned by route path:
- `pages/posts/**` → `post`
- `pages/tags/**` → `tags`
- `pages/categories/**` → `categories`
- Everything else → `default` (unless overridden via `layout:` in frontmatter)

### Starter Template

Reference: https://github.com/valaxyjs/valaxy-theme-starter

For generation from a visual brief, install the repository's `valaxy-theme` skill. The starter separates the `theme/` source package from its `demo/` consumer; initialize their package references together and validate the actual SSG build before publishing.

## Addon Development

### File Structure

```txt
valaxy-addon-{name}/
├── client/                 # Vue components/stores
├── node/                   # Node-side setup
├── components/             # Auto-imported Vue components
├── valaxy.config.ts        # defineAddon() export
└── index.ts                # Package entry (addon factory function)
```

### Key APIs

**`defineAddon()` — addon config:**

```ts
// valaxy.config.ts
import { defineAddon } from 'valaxy'

export default defineAddon({
  vite: {
    // Vite config extensions
  },
})
```

**Addon factory function (package entry):**

```ts
// index.ts
import type { ValaxyAddon } from 'valaxy'

export function addonExample(options: ExampleOptions = {}): ValaxyAddon<ExampleOptions> {
  return {
    name: 'valaxy-addon-example',
    enable: options.enable !== false,
    options,
    // Optional:
    global: options.global ?? false,
    props: { /* default prop values */ },
    setup(node) { /* node-side setup */ },
  }
}
```

**User registration:**

```ts
// valaxy.config.ts
import { addonExample } from 'valaxy-addon-example'

export default defineValaxyConfig({
  addons: [
    addonExample({ /* options */ }),
    'valaxy-addon-components', // string shorthand
    ['valaxy-addon-meting', { global: true }], // array shorthand
  ],
})
```

### Addon Capabilities

- Provide auto-imported Vue components (place in `components/`)
- Extend Vite config
- Hook into lifecycle events
- Register CLI commands
- Export composables for user code

## Post Frontmatter Reference

```yaml
---
title: Post Title # string or { en: 'Title', zh-CN: '标题' }
date: 2024-01-01
updated: 2024-01-02
categories: Category Name # string or string[]
tags:
  - tag1
  - $locale:tag.notes # i18n tag key
cover: https://... # cover image URL
top: 1 # pin priority (higher = pinned higher)
draft: true # hidden in production
hide: true # hide from lists (true | 'all' | 'index')
password: secret # encrypt entire post
password_hint: hint text
excerpt: Custom summary text # overrides <!-- more --> marker
excerpt_type: html # md | html | text
layout: post # override layout
sidebar: false # hide sidebar
aside: false # hide TOC panel
toc: false # hide table of contents
codeHeightLimit: 300 # max code block height in px
markdownClass: custom-class
pageTitleClass: text-4xl
medium_zoom: true
sponsor: false # override global sponsor
from: /old-path # redirect old URLs
outline: deep # TOC depth
---
```

## User Site Directory Structure

```txt
my-blog/
├── pages/
│   ├── posts/              # Blog posts (.md) — auto-counted as posts
│   ├── index.md            # Home page
│   └── about.md            # Other pages
├── styles/
│   └── index.ts            # Custom styles (auto-loaded)
├── components/             # Custom/override Vue components (auto-registered)
├── layouts/                # Custom layouts (use via layout: xxx frontmatter)
├── locales/                # Custom i18n keys (.yml files)
├── public/                 # Static assets
├── site.config.ts          # Site metadata
├── valaxy.config.ts        # Framework config
├── theme.config.ts         # Theme-specific config (optional)
└── package.json
```

## Available Addons

| Addon | Purpose |
|---|---|
| `valaxy-addon-algolia` | Algolia search |
| `valaxy-addon-components` | Common components (CodePen, VCLiveTime) |
| `valaxy-addon-lightgallery` | Image gallery viewer |
| `valaxy-addon-waline` | Waline comment system |
| `valaxy-addon-twikoo` | Twikoo comment system |
| `valaxy-addon-bangumi` | Anime watching list |
| `valaxy-addon-meting` | Global music player |
| `valaxy-addon-live2d` | Live2D mascot |
| `valaxy-addon-git-log` | Git log contributors |
| `valaxy-addon-hitokoto` | Random quotes |
| `valaxy-addon-vercount` | Page view counter |
| `valaxy-addon-abbrlink` | Short permalink hashes |
