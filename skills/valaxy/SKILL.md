---
name: valaxy
description: >
  Valaxy static blog framework built with Vue 3, Vite, and pnpm workspaces. Use when working with
  Valaxy projects: (1) creating or configuring Valaxy blog sites (site.config.ts, valaxy.config.ts),
  (2) writing blog posts with frontmatter, (3) developing Valaxy themes (valaxy-theme-*),
  (4) developing Valaxy addons (valaxy-addon-*), (5) customizing components/layouts/styles,
  (6) working with the Valaxy monorepo core framework, (7) debugging Valaxy builds or dev server,
  (8) deploying Valaxy sites. Triggers on: valaxy.config.ts, site.config.ts, theme.config.ts,
  defineValaxyConfig, defineSiteConfig, defineThemeConfig, defineTheme, defineAddon, valaxy-theme-*,
  valaxy-addon-*, pages/posts/, ValaxyMain, useSiteConfig, useFrontmatter, #valaxy/config.
---

# Valaxy

Next-generation static blog framework: Vue 3 + Vite + UnoCSS + file-based routing + markdown-it.

## Quick Reference

```bash
pnpm create valaxy          # scaffold new site
pnpm i                      # MUST use pnpm
pnpm dev                    # dev server at localhost:4859
pnpm build                  # SSG build to dist/
```

**Two config files:**
- `site.config.ts` — site metadata (title, author, social, search, comments) via `defineSiteConfig()`
- `valaxy.config.ts` — framework config (theme, addons, markdown, vite) via `defineValaxyConfig<ThemeConfig>()`
- Optional `theme.config.ts` — theme-specific via `defineThemeConfig()`

**Posts** go in `pages/posts/*.md`. Frontmatter controls title, date, tags, categories, cover, draft, encryption, layout, etc.

## Key Patterns

### Config Merging

Config sources merge via `defu` (user wins): Default → Theme → Addons → User.

### File Resolution (Roots System)

```txt
roots = [clientRoot, themeRoot, ...addonRoots, userRoot]
```

User components/layouts/styles override theme which overrides core — by filename matching.

### Routing

File-based via `vue-router/vite`. Files in `pages/` become routes. Layout auto-assigned:
- `pages/posts/**` → `post` layout
- `pages/tags/**` → `tags` layout
- `pages/categories/**` → `categories` layout

Override with `layout: xxx` in frontmatter.

### Collections

Define in `pages/collections/{name}/index.ts` using `defineCollection()`:

```ts
import { defineCollection } from 'valaxy'

export default defineCollection({
  key: 'hamster',
  title: 'Hamster Stories',
  items: [
    { title: 'Chapter 1', key: '1' },
  ],
})
```

### i18n

- CSS-based bilingual: `::: zh-CN` / `::: en` containers in markdown
- File-based: `locales/*.yml`
- Frontmatter: `title: { en: 'Title', 'zh-CN': '标题' }`
- Tags: `$locale:tag.notes` syntax

### Custom Styles

Create `styles/index.ts` (or `.scss`/`.css`) — auto-loaded. Override CSS vars for theming.

### Custom Components

Place `.vue` files in `components/` — auto-registered, overrides theme/core components by name.

## Monorepo Development

When working on the Valaxy core framework itself:

```bash
pnpm i                     # install all workspace deps
pnpm run build             # build core: utils → valaxy → devtools
pnpm dev:lib               # watch core packages
pnpm demo                  # run demo site
pnpm docs:dev              # run docs site
pnpm test                  # unit tests (vitest)
pnpm e2e                   # E2E tests (playwright)
pnpm lint                  # eslint
pnpm typecheck             # type check
```

### Repository URL Normalization

When displaying repository URLs from package.json, import and use `normalizeRepositoryUrl()` from `@valaxyjs/utils` to remove the `git+` prefix.

## References

- **Framework architecture, virtual modules, composables, components**: Read [references/architecture.md](references/architecture.md)
- **Theme/addon development, post frontmatter, addon gallery**: Read [references/theme-addon-dev.md](references/theme-addon-dev.md)
