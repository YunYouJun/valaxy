# Build plugin snapshots

These MIT-licensed distribution snapshots keep Valaxy's stable compiler and layout
behavior while removing the vulnerable `fast-glob → micromatch → braces` chain
from published packages. `sources.json` records the original npm versions, source
repositories and SHA-256 hashes of every copied file. Each directory includes its
upstream license. Other runtime dependencies remain explicit in Valaxy's manifest.

Changes relative to the recorded distributions:

- `@intlify/unplugin-vue-i18n@11.2.5`: replace its async file scanner with
  `tinyglobby.glob`, requesting absolute locale paths for Windows cross-drive
  projects. Keep the stable message compiler and SFC transforms.
- `vite-plugin-vue-layouts-next@3.2.0`: replace async/sync scanners with
  `tinyglobby.glob`/`globSync`; resolve directory globs against Vite's root;
  import the included browser runtime through `valaxy/vendor/layouts/runtime.mjs`.
  Browser runtime and layout-name normalization are otherwise unchanged.
- `unplugin-vue-components@32.1.0`: sort component paths by the configured glob
  priority when rebuilding the registry. This preserves core → theme → addon →
  user overrides after initial discovery and file additions/removals, independent
  of filesystem traversal order. The included utility chunk is unchanged.

`index.mjs`/`index.d.mts` adapters select the Vite entry and provide ESM types.
The upstream formatting is retained to keep these changes reviewable.
`test/build-plugins.test.ts` covers overrides, hot updates, literal project paths
and compiled JSON/YAML locales. Full Yun/Press SSG and packed-consumer tests verify
the published artifacts. No audit exemptions or consumer overrides are needed
for the replacement scanners. Remove a snapshot once its upstream stable release
provides the same scanning/ordering behavior and passes these regressions.
