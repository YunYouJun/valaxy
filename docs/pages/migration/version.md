---
title:
  en: Version Migration
  zh-CN: 版本迁移
categories:
  - migration
top: 8
---

## v1.0.0

v1.0.0 is the first stable release. It contains several breaking changes, mostly removals of long-deprecated options. Most blogs need no changes; review the items below if you used these features.

### Node.js: minimum version is now `>=22.12.0`

Valaxy now requires Node.js `>=22.12.0` (previously `^18 || >=20`). This comes from `unplugin-vue-markdown@32` (which requires Node `>=22`) combined with Vite 8 (`^20.19.0 || >=22.12.0`) — on the Node 22 line the minimum is `22.12.0`. **Node 18 and 20 are no longer supported.** Upgrade your local, CI, and deploy environments before updating (see [#710](https://github.com/YunYouJun/valaxy/pull/710)).

### SSG: legacy `vite-ssg` engine removed

The JSDOM-based `vite-ssg` SSG engine has been removed (it was broken under pnpm; see [#706](https://github.com/YunYouJun/valaxy/issues/706)). There is now a single built-in Valaxy SSG engine.

- The `--ssg-engine` CLI flag and the `build.ssg.engine` config option are gone — just run `valaxy build --ssg`.
- `vite.ssgOptions` is still supported but now follows the `ValaxySSGOptions` shape: `concurrency`, `includedRoutes`, `includeAllRoutes`, `onBeforePageRender`, `onPageRendered`, `onFinished`. The `vite-ssg`-only options (`dirStyle`, `beastiesOptions`, `formatting`, `script`) no longer exist.
- **Critical CSS inlining (beasties) is removed.** Flash-of-unstyled-content is handled by the FOUC guard instead (`build.foucGuard`).
- For directory-style output (`/foo/index.html`), use a directory index page (`pages/foo/index.md`) instead of the old `dirStyle: 'nested'` option.

### Music player moved to `valaxy-addon-meting`

The built-in `aplayer: true` frontmatter switch no longer loads the music player. Install and enable the addon:

```ts
// valaxy.config.ts
import { addonMeting } from 'valaxy-addon-meting'

export default defineValaxyConfig({
  addons: [addonMeting()],
})
```

`<meting-js>` usage in Markdown is otherwise unchanged. See [Music Player](/guide/third-party#music-player).

### Config & frontmatter removals

- **`ignoreDeadLinks`** at the config root → use `build.ignoreDeadLinks`.
- **`unocssPresets.uno`** → use `unocssPresets.wind4` (it was already a no-op since the wind3→wind4 migration).
- **Frontmatter `color`** (title color) was removed from core types. It is a theme concern — `valaxy-theme-yun` still reads it at runtime; prefer `pageTitleClass` / `postTitleClass`.

### SSR globals

If a theme or addon relied on the old engine's JSDOM (which silently provided `window` / `document` / `navigator` during SSR), guard those accesses — the current engine renders pure strings with no DOM. See [SSR Compatibility](/guide/ssr-compat).

## v0.21.0

### Import Common Styles Yourself

Theme developers need to import the common styles `valaxy/client/styles/common/index.scss` themselves.

See [Import Default Styles](/themes/write#引入默认样式).
