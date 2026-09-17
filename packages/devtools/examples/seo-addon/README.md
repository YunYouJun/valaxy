# Reference addon: SEO DevTools

This is a development example, not a production SEO addon. Its frontmatter fields are inert unless a theme consumes them.

From the repository root, build the DevTools package and this panel:

```sh
pnpm run build:devtools
pnpm exec vite build --config packages/devtools/examples/seo-addon/vite.config.ts
```

In `demo/yun/valaxy.config.ts`, add this to the existing `addons` array:

```ts
const addon = {
  name: '../../packages/devtools/examples/seo-addon',
  devtools: () => import('../../packages/devtools/examples/seo-addon/devtools'),
}
```

Run `pnpm demo`. The Vite DevTools Dock's Valaxy group contains SEO Overview. The Valaxy panel's Addons page also opens it directly. Open a post to add optional SEO fields, inspect its unsaved draft, and save through the core editor.

The example uses no addon setup watcher: its panel subscribes to Valaxy's shared data revision. Edits made in another panel or on disk refresh the list. Node-side setup can use the same `data` API plus `onDispose` for listeners or timers. Register custom RPC through the provided scoped `rpc`; for this addon a function named `inspect` becomes `valaxy:addon:seo-example:inspect`.

Keep prebuilt client assets and the Node entry in the published addon. A published addon factory can return `{ name: 'valaxy-addon-example', devtools: () => import('./devtools.js') }`; Valaxy imports the entry only when devtools are enabled. Changing the descriptor requires a dev-server restart; rebuilding client assets requires reloading its panel.
