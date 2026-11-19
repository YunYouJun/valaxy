---
title:
  en: Version Migration
  zh-CN: 版本迁移
categories:
  - migration
top: 8
---

## v1.4.0 {#v140}

Valaxy 1.4.0 makes a compatibility exception for two changes. Review the impact below before upgrading.

### CodePen embeds

Valaxy 1.4.0 removes `codepen: true` and `useCodePen()`. Articles that relied on the frontmatter flag will show only the original embed placeholder until migrated. Code that imports `useCodePen()` from `valaxy` will fail to build. Choose an embed format for each affected article, then remove the old frontmatter flag and replace any calls to the composable.

1. **Use the `<CodePen>` component.** Install `valaxy-addon-components`, add `addonComponents()` to `addons` in `valaxy.config.ts`, then place the component in your Markdown. It loads the embed script automatically. See [Components](/guide/built-ins).

   ```md
   <CodePen user="YunYouJun" id="WqXGpo" name="Margin Collapse" class="h-300px" />
   ```

2. **Paste CodePen's iframe.** Copy the iframe version from the Pen's Embed dialog into your Markdown. This works without a Valaxy addon or a script in the host page. See [CodePen's iframe documentation](https://blog.codepen.io/docs/embeds/#iframe).

   ```html
   <iframe
     src="https://codepen.io/YunYouJun/embed/WqXGpo"
     title="Margin Collapse"
     width="100%"
     height="300"
     loading="lazy"
   ></iframe>
   ```

To keep your existing `<p class="codepen">` markup, load its script with `useScriptTag()` as shown in [Scripts](/guide/post#scripts).

### Yun title classes

`pageTitleClass` and `postTitleClass` are now typed by `valaxy-theme-yun`. Projects that load only Valaxy's core types see them as generic custom fields and lose field-specific completion and type checking. Yun accepts the same keys in Markdown frontmatter and in `site.config.ts` under `frontmatter`. The starter's `UserThemeConfig` import already loads the Yun declarations. If your project selects Yun by name alone, add `import 'valaxy-theme-yun'` to a project declaration file such as `env.d.ts`.

## v1.3.0 {#v130}

### Footnote previews and tooltips {#footnote-previews-and-tooltips}

Footnote previews now always use Reka UI. Remove `footnote.preview` and `floatingVue` from your site configuration. If your own content still uses `v-tooltip`, see [Migrating from Floating Vue](/guide/markdown#migrating-from-floating-vue) for the replacement or explicit registration.

### Browser template compilation

`vue.browserTemplateCompilation` now defaults to `'lazy'`: HTML excerpts and decrypted templates load the compiler when needed. Use [`ValaxyDynamicComponent`](/guide/custom/components#browser-template-compilation) for your own template strings, or set `vue.browserTemplateCompilation: true` in `valaxy.config.ts` if your code uses Vue's `template` option or calls `compile()` directly in the browser. Set it to `false` only if the site does not need browser template compilation.

## v1.0.0

v1.0.0 is the first stable release. It contains several breaking changes, mostly removals of long-deprecated options. Most blogs need no changes; review the items below if you used these features.

### Mermaid → `valaxy-addon-mermaid`

Starting with Valaxy **1.0.0-rc.16**, Mermaid has moved to the optional official `valaxy-addon-mermaid` package. Install and enable it only if your site uses diagrams. Existing Markdown fences remain unchanged.

```bash
pnpm add valaxy@latest valaxy-addon-mermaid
```

```ts
// valaxy.config.ts
import { defineValaxyConfig } from 'valaxy'
import { addonMermaid } from 'valaxy-addon-mermaid'

export default defineValaxyConfig({
  addons: [addonMermaid()],
})
```

Without the addon, actual Mermaid fences or legacy `setup/mermaid.ts` trigger an actionable migration notice. Fences stay readable as source. Existing setup files continue to work after enabling the addon; import `defineMermaidSetup`, `MermaidOptions`, and `MermaidSetup` from the addon.

[Mermaid addon](/addons/official/mermaid)

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

Use the addon's `<MetingJs>` Vue component for inline players; it loads the required scripts. A raw `<meting-js>` tag works only after the page has loaded MetingJS, for example through `addonMeting({ global: true })`. See [Music Player](/guide/third-party#music-player).

### Config & frontmatter removals

- **`ignoreDeadLinks`** at the config root → use `build.ignoreDeadLinks`.
- **`unocssPresets.uno`** → use `unocssPresets.wind4` (it was already a no-op since the wind3→wind4 migration).
- **Frontmatter `color`** (title color) was removed from core types. It is a theme concern — `valaxy-theme-yun` still reads it at runtime; prefer `pageTitleClass` / `postTitleClass`.

### SSR globals

If a theme or addon relied on the old engine's JSDOM (which silently provided `window` / `document` / `navigator` during SSR), guard those accesses — the current engine renders pure strings with no DOM. See [SSR Compatibility](/guide/ssr-compat).

### Build plugin types

Valaxy now ships the layout and locale compiler integrations itself to remove the
vulnerable brace-parser dependency. Their virtual module types are included by
`valaxy/client`. In an existing `tsconfig.json`, remove
`vite-plugin-vue-layouts-next/client` and `@intlify/unplugin-vue-i18n/messages`
from `compilerOptions.types`; keep `vite/client` and `valaxy/client`.
Layout options, locale files, SFC `<i18n>` blocks and component overrides continue
to work. New scaffolds already use this configuration.

## v0.21.0

### Import Common Styles Yourself

Theme developers need to import the common styles `valaxy/client/styles/common/index.scss` themselves.

See [Import Default Styles](/themes/write#引入默认样式).
