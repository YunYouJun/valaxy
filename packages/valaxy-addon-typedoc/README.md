# valaxy-addon-typedoc

Generate TypeScript API reference pages inside a Valaxy site. TypeDoc runs on the Node side; Press provides navigation and the normal documentation layout.

This addon requires the generated-content integration in the next Valaxy release. Until that release, use it from this repository's pnpm workspace.

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonTypeDoc } from 'valaxy-addon-typedoc'

export default defineValaxyConfig({
  theme: 'press',
  addons: [addonTypeDoc({
    options: './typedoc.json',
    watch: ['../src/**/*.ts', './tsconfig*.json'],
    routeBase: '/api/',
    // Set true when pages/api/index.md provides a handwritten overview.
    excludeIndex: true,
  })],
})
```

```json
{
  "entryPoints": ["../src/index.ts"],
  "tsconfig": "./tsconfig.typedoc.json",
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeInternal": true
}
```

`options` and `watch` are relative to the Valaxy site. Paths in TypeDoc's JSON configuration are relative to that configuration file. Use an explicit `tsconfig` to avoid accidentally compiling the documentation app. Include source directories in `watch` so new exports and files trigger regeneration. TypeDoc program dependencies and extended TypeScript configurations are also tracked.

The addon owns the Markdown output settings and writes under `.valaxy/content/pages/`. Do not edit these generated files. The cache fingerprints source contents, configuration, dependency declarations, compiler/plugin versions and Git revision. Remove `.valaxy/content/` to force a clean generation.

In development, changes are debounced and serialized. Ordinary Markdown edits do not run TypeDoc. A failed generation keeps the last successful pages and logs an error. Production generation failures stop the build; a matching cache is valid reuse. Empty references, duplicate routes and collisions with handwritten pages are errors.

The generated Press sidebar is installed only for `routeBase`, preserving other sidebar sections. Set `sidebar: false` to manage navigation yourself. Generated pages use `sharedLocale: true`: one reference URL across interface languages. `themeConfig.apiReference` and each page's `apiSource` contain the source revision, package version when available, and whether the checkout has uncommitted changes.

Keep guides and examples handwritten. An optional `<PressApiIndex :groups="groups" />` provides a category index with client-side filtering; each group has a `title` and `items: { text, link }[]`.

Deploy the resulting site normally. HTTP redirects from a retired API domain must be configured on that domain's host; installing this addon does not change DNS or redirects.
