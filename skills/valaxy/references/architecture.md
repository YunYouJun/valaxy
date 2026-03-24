# Valaxy Architecture Reference

## Table of Contents

- [Monorepo Structure](#monorepo-structure)
- [Core Package Layout](#core-package-layout)
- [Configuration System](#configuration-system)
- [Roots & File Resolution](#roots--file-resolution)
- [Virtual Modules](#virtual-modules)
- [Routing System](#routing-system)
- [Markdown Processing](#markdown-processing)
- [SSG Build](#ssg-build)
- [Key Composables](#key-composables)
- [Key Components](#key-components)

## Monorepo Structure

```txt
valaxy/
├── packages/
│   ├── @valaxyjs/utils/           # Shared utilities (build first)
│   ├── valaxy/                    # Core framework
│   ├── create-valaxy/             # CLI scaffolding (pnpm create valaxy)
│   ├── devtools/                  # DevTools integration
│   ├── valaxy-theme-yun/          # Default blog theme
│   ├── valaxy-theme-press/        # Docs theme (VitePress-like)
│   └── valaxy-addon-*/            # Official addons
├── demo/yun/                      # Demo site (theme-yun)
├── demo/custom/                   # Custom theme demo
├── docs/                          # Docs site (uses valaxy-theme-press)
├── e2e/                           # Playwright E2E tests
└── test/                          # Vitest unit tests
```

Build order: `@valaxyjs/utils` → `valaxy` → `devtools`

## Core Package Layout

`packages/valaxy/` is split into Node (build-time) and Client (runtime):

**Node (`node/`):**
- `cli/` — CLI commands: `dev`, `build`, `new`, `clean`, `deploy`, `debug`, `rss`
- `config/` — Config resolution: `site.ts`, `valaxy.ts`, `theme.ts`, `addon.ts`
- `plugins/` — Vite plugin orchestration
  - `preset.ts` — Main plugin composition
  - `markdown/` — markdown-it pipeline
  - `vueRouter.ts` — File-based routing (vue-router/vite)
  - `valaxy.ts` — Virtual module generation
  - `unocss.ts` — UnoCSS integration
- `modules/` — Built-in features (RSS, Fuse search)

**Client (`client/`):**
- `main.ts` — Entry point
- `app/` — Runtime data (useValaxyHead, useSiteConfig)
- `composables/` — Vue composables (posts, tags, categories, etc.)
- `components/` — Core Vue components
- `layouts/` — Layout components
- `setup/` — App setup hooks
- `modules/` — Client-side module registration

**Shared (`shared/`):**
- Isomorphic code used by both node and client

## Configuration System

Two main config files, merged with `defu` (user wins):

### `site.config.ts` (site metadata, theme-agnostic)

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  lang: 'zh-CN',
  title: 'My Blog',
  subtitle: '',
  url: 'https://example.com',
  author: { name: 'Author', avatar: '/avatar.png' },
  description: '',
  timezone: 'Asia/Shanghai',
  orderBy: 'date', // 'date' | 'updated'
  social: [
    { name: 'GitHub', link: '...', icon: 'i-ri-github-line', color: '#333' },
  ],
  search: { enable: true, provider: 'fuse' }, // 'fuse' | 'algolia'
  comment: { enable: true },
  mediumZoom: { enable: true },
  vanillaLazyload: { enable: true },
  statistics: { enable: true },
  sponsor: { enable: true, methods: [] },
  encrypt: { enable: true },
  llms: { enable: true, files: true },
  redirects: { useVueRouter: true, rules: [] },
})
```

### `valaxy.config.ts` (framework + theme + addons)

```ts
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  theme: 'yun',
  devtools: true,
  build: { ssgForPagination: true },
  themeConfig: { /* theme-specific options */ },
  addons: [
    addonWaline({ serverURL: '...' }),
    'valaxy-addon-components', // string shorthand
    ['valaxy-addon-meting', { global: true }], // array shorthand
  ],
  unocss: { safelist: ['i-ri-home-line'] },
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    blocks: {
      tip: { icon: 'i-carbon-thumbs-up', text: 'ヒント' },
      warning: { icon: 'i-carbon-warning-alt', text: '注意' },
      danger: { icon: 'i-carbon-warning', text: '警告' },
      info: { text: 'Info' },
    },
    codeTransformers: [],
  },
  groupIcons: { customIcon: {} },
  // Advanced:
  vite: { /* Vite config overrides */ },
  vue: { /* Vue plugin options */ },
  modules: { rss: { enable: true } },
})
```

### Theme-specific config (`theme.config.ts`, optional)

```ts
import { defineThemeConfig } from 'valaxy-theme-yun/client'

export default defineThemeConfig({
  banner: { enable: true, title: 'My Blog' },
  colors: { primary: 'red' },
  nav: [],
  pages: [],
  footer: { since: 2020, beian: { enable: false } },
})
```

**Merge order:** Default → Theme → Addons → User (user wins via `defu`)

## Roots & File Resolution

Priority order (later wins):
```txt
roots = [clientRoot, themeRoot, ...addonRoots, userRoot]
```

User files override theme files which override core files. This applies to:
- Vue components (by filename)
- Layouts (by filename)
- Styles
- Locales

## Virtual Modules

Generated at build time via Vite plugins:
- `/@valaxyjs/config` (alias `#valaxy/config`) — JSON-stringified resolved config
- `/@valaxyjs/styles` (alias `#valaxy/styles`) — Combined styles from all roots
- `/@valaxyjs/context` — `{ userRoot }`
- `/@valaxyjs/addons` — Auto-imported global addon components
- `/@valaxyjs/ThemeAppVue` — Theme's App.vue
- `/@valaxyjs/UserAppVue` — User's App.vue
- `/@valaxyjs/blog/collections` — Collection configs
- `virtual:generated-layouts` — Layout routes

## Routing System

- File-based via `vue-router/vite`
- `.vue` and `.md` files in `pages/` directory (scanned across all roots)
- Files in `pages/posts/` are auto-counted as blog posts
- Frontmatter parsed from `.md` and merged into `route.meta.frontmatter`
- Draft posts (`draft: true`) filtered in production
- Chinese filenames are URI-encoded

**Auto layout assignment** (`vueRouter.ts`):

| Path | Layout |
|---|---|
| `/` or `/page` | `home` |
| `/posts/` (index) | `posts` |
| `/posts/**` (leaf) | `post` |
| `/collections/*/**` | `collection` |
| frontmatter `layout:` | overrides all |
| default | theme's `default` |

**Component auto-import:** All `components/` dirs in the roots chain are auto-imported with `unplugin-vue-components`. `allowOverrides: true` — user overrides theme overrides core.

## Markdown Processing

Two-stage pipeline:

**Stage 1 — Route extraction** (`vueRouter.ts`):
1. Extract frontmatter with `gray-matter` (+ excerpt at `<!-- more -->`)
2. Assign layout from frontmatter or by path convention
3. Process `from:` redirects, strip passwords
4. Resolve excerpt (`getExcerptByType`: md|html|text|ai)
5. Run statistics (word count, reading time) if enabled
6. Call `valaxyConfig.extendMd?.(ctx)` user hook
7. Fire `md:afterRender` hook

**Stage 2 — Transform to Vue SFC** (via `unplugin-vue-markdown`):
```txt
Raw Markdown → transformMermaid → transformIncludes → transformCodeBlock
  → transformEncrypt → transformFootnoteTooltip → transformHexoTags
  → markdown-it render → getValaxyMain (wrap in ValaxyMain) → Vue SFC
```

**markdown-it plugins** (in order): highlightLine, preWrapper, snippet, container (tip/warning/danger/info/details/code-group/zh-CN/en), cssI18nContainer, link, lineNumber, attrs, emoji, footnote+tooltip, anchor, headers, sfc, title, toc, KaTeX|MathJax, imageFigures, taskLists, groupIcon.

Custom blocks configurable via `markdown.blocks` in `valaxy.config.ts`.

Supported extensions: emoji, TOC (`[[toc]]`), code highlighting with line numbers, diff annotations (`// [!code ++]`), custom containers, KaTeX/MathJax math, mermaid diagrams, footnotes, code groups, file inclusion (`<!--@include: ./file.md-->`).

## SSG Build

- Powered by `vite-ssg` with `ViteSSG`
- Filters `draft: true` posts in production
- Supports pagination (`build: { ssgForPagination: true }`)
- Generates sitemap via `vite-ssg-sitemap`
- Critical CSS inlined via `beasties`
- FOUC guard: `body { opacity: 0 }` until CSS loads (`build.foucGuard`)

## Node Hooks

Available via `hooks` in `valaxy.config.ts`:

```js
const hooks = {
  'options:resolved': () => { /* after options resolved */ },
  'config:init': () => { /* after config init */ },
  'vue-router:extendRoute': (route) => { /* modify route tree node */ },
  'vue-router:beforeWriteFiles': (root) => { /* before route files written */ },
  'md:afterRender': (ctx) => { /* after markdown rendered */ },
  'build:before': () => { /* before build starts */ },
  'build:after': () => { /* after build completes */ },
}
```

## Key Composables

From `valaxy` package exports:

| Composable | Purpose |
|---|---|
| `useValaxyConfig()` | Full resolved config |
| `useSiteConfig()` | Site config |
| `useThemeConfig<T>()` | Theme config (typed) |
| `useRuntimeConfig()` | Runtime config (addons, redirects) |
| `useFrontmatter<T>()` | Current page frontmatter |
| `useData()` | ValaxyData (page + frontmatter) |
| `useFullUrl()` | Current page full URL |
| `useLayout()` | Get current layout name (or check: `useLayout('home')`) |
| `usePostList()` | Filtered/sorted posts |
| `usePageList()` | All pages |
| `useCategories(path?)` | Category tree |
| `useTags()` | Tag map |
| `usePagination()` | Pagination state |
| `usePrevNext()` | Previous/next post |
| `useValaxyDark()` | Dark mode (isDark, toggleDark, toggleDarkWithTransition) |
| `useSidebar()` | Sidebar state (isOpen, hasSidebar, toggle) |
| `useAside()` | Aside/TOC panel state |
| `useMobile()` | Mobile breakpoint (max-width: 768px) |
| `useLocale()` | Language switching |
| `useLocaleTitle()` | Resolve i18n title from frontmatter |
| `useValaxyI18n()` | $t, $tO, locale |
| `useAppStore()` | Pinia app store (isDark, isMobile, showLoading) |
| `useSiteStore()` | Pinia site store (postList) |
| `useCollections()` | All collections |
| `useCollection()` | Current collection by route |
| `onContentUpdated(fn)` | Callback after markdown DOM update |
| `useCopyCode()` | Code block copy |
| `useCollapseCode()` | Code block collapse |
| `useMediumZoom()` | Image zoom |
| `$t(key)` | i18n helper for site.config.ts |

## CLI Commands

| Command | Description | Key Options |
|---|---|---|
| `valaxy [root]` | Start dev server (port 4859) | `--port`, `--open`, `--remote`, `--log` |
| `valaxy build [root]` | Build for production | `--ssg`, `--output` (default `dist`), `--log` |
| `valaxy new <title>` | Create new post | `--folder`, `--path`, `--layout` (default `post`), `--date` |
| `valaxy clean` | Remove `dist/` and `.valaxy/` cache | — |
| `valaxy deploy` | Interactive deploy | — |
| `valaxy debug` | Show version info | — |
| `valaxy fuse [root]` | Generate fuse search list | — |
| `valaxy rss [root]` | Generate RSS feed | — |
| `valaxy llms [root]` | Generate llms.txt | — |

## Key Components

Core components (auto-imported, overridable):

| Component | Purpose |
|---|---|
| `ValaxyMain` | Main content wrapper (themes MUST provide) |
| `ValaxyMd` | Markdown content renderer |
| `AppLink` | Smart link (internal/external) |
| `ValaxyPagination` | Pagination for post lists |
| `ValaxyOverlay` | Overlay backdrop |
| `ValaxyHitokoto` | Random quote widget |
| `ValaxyDecrypt` | Post encryption/decryption |
