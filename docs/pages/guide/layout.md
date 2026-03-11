---
title: Layout
categories:
  - guide
---

The framework API currently supports the following layouts by default. Layout support and final appearance are usually related to the theme.

- `post`: Post layout
- `tags`: Tags layout
- `archives`: Archives layout
- `categories`: Categories layout
- `collections`: Collections layout

## Using Layouts

### Collections Layout

Collections allow you to group a series of related articles (e.g. a novel, a tutorial series) into a single unit with ordered navigation.

#### Directory Structure

```txt
pages/
  collections/
    index.md              # Collections overview page
    hamster/              # A single collection
      index.ts            # Collection config (required)
      index.md            # Collection entry page
      1.md                # Article 1
      2.md                # Article 2
      to-be-or-not.md     # Article with string key
```

#### 1. Create the Overview Page

Create `pages/collections/index.md` with `layout: collections`:

```md [pages/collections/index.md]
---
layout: collections
icon: i-ri-gallery-view
collections:
  - hamster
  - love-and-peace
---
```

#### 2. Create a Collection

Create the collection folder `pages/collections/hamster/` with:

- `index.ts`: Collection config file (required).
- `index.md`: Collection entry page.
- `1.md`, `2.md`, ...: Articles in the collection.

Create the entry page `pages/collections/hamster/index.md`:

```md [pages/collections/hamster/index.md]
---
layout: collection
---
```

Define the collection config in `index.ts`:

```ts [pages/collections/hamster/index.ts]
import { defineCollection } from 'valaxy'

export default defineCollection({
  key: 'hamster',
  title: 'Hamster',
  cover: 'https://cover.sli.dev',
  description: 'The story of I and She',
  items: [
    { title: 'Chapter 1 - The Cage', key: '1' },
    { title: 'Chapter 2 - Daylight', key: '2' },
    { title: 'Chapter 3 - Cocoon', key: '3' },
  ],
})
```

#### 3. Create Articles

> `layout: collection` can be omitted — all articles under `pages/collections/` use the `collection` layout by default.

```md [pages/collections/hamster/1.md]
---
title: Chapter 1 - The Cage
---

Your article content here.
```

Preview: [Collection | Valaxy Theme Yun](https://yun.valaxy.site/collections/hamster/1)

### CollectionConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `key` | `string` | Directory name | Unique identifier. Auto-derived from the directory name if omitted. |
| `title` | `string` | — | Display title of the collection. |
| `cover` | `string` | — | Cover image URL. |
| `description` | `string` | — | Short description. |
| `categories` | `string[]` | — | Categories for the collection card. |
| `tags` | `string[]` | — | Tags for the collection card. |
| `collapse` | `boolean` | `true` | Whether to show the collection as a single collapsed card in homepage/archive post lists. See [Collapse Mode](#collapse-mode). |
| `items` | `{ title?, key?, link? }[]` | — | Ordered list of articles. `key` maps to the `.md` filename (e.g. `key: '1'` → `1.md`). `link` references an existing page or external URL. `key` and `link` are mutually exclusive; if both are set, `link` takes precedence. Determines the article reading order and prev/next navigation. |

### Collapse Mode

::: tip
`collapse` is an experimental feature available since `v0.28.0`.
:::

When `collapse` is `true` (default), the collection appears as a **single card** in the homepage and archive post lists, replacing individual article entries. This keeps the post list clean when you have many collection articles.

```ts
export default defineCollection({
  title: 'My Series',
  collapse: true, // default — show as one card
  items: [/* ... */],
})
```

When `collapse` is `false`, no synthetic entry is added to the post list.

```ts
export default defineCollection({
  title: 'My Series',
  collapse: false, // no card in post list
  items: [/* ... */],
})
```

### Linking External Content

You can reference existing blog posts or external URLs in a collection's reading order using the `link` field. This is useful when your collection includes content that lives outside the collection directory.

- Internal links (starting with `/`) navigate within the site using `<RouterLink>`.
- External links (e.g. `https://...`) open in a new tab with an external-link icon.
- `key` and `link` are mutually exclusive per item. If both are set, `link` takes precedence.

```ts
export default defineCollection({
  title: 'My Learning Path',
  items: [
    { title: 'Chapter 1 - Basics', key: '1' },
    { title: 'Related Blog Post', link: '/posts/my-related-article' },
    { title: 'Chapter 2 - Advanced', key: '2' },
    { title: 'External Reference', link: 'https://example.com/resource' },
  ],
})
```

## Implementing Layouts (Theme Developers)

[valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) supports the `collections` layout since `v0.25.9`.

By convention, themes should create layout files in the `layouts` directory, with the filename matching the layout name.

The following composables are available for collection support in themes:

- `useCollections()` — Get all collection configs.
- `useCollection()` — Get the current collection (resolved from the route path).
- `useCollectionPosts(key)` — Get posts belonging to a specific collection, sorted by the order defined in `items`.
- `usePostListWithCollections()` — Get the post list with collapsed collection entries merged in.

<<< @/../packages/valaxy-theme-yun/layouts/collections.vue

## FAQ

### Child pages with multiple layout nesting

Vue Router pages will automatically nest parent layouts, please refer to [Nested Routes | Vue Router](https://uvr.esm.is/guide/file-based-routing#nested-routes).

For example, change:

`pages/users/create.vue` to `pages/users.create.vue`.
