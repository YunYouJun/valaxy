# Build plugin snapshots

These MIT-licensed distribution snapshots keep Valaxy's component discovery
behavior while removing the vulnerable `fast-glob → micromatch → braces` chain
from published packages. `sources.json` records the original npm versions, source
repositories and SHA-256 hashes of every copied file. Each directory includes its
upstream license. Other runtime dependencies remain explicit in Valaxy's manifest.

Changes relative to the recorded distributions:

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

The layout system was vendored from `vite-plugin-vue-layouts-next@3.2.0` until Valaxy
replaced it with its own `node/plugins/layouts.ts` and `client/utils/layouts.ts`,
which keep that plugin's options, layout-name normalization and runtime behavior.

`@intlify/unplugin-vue-i18n` was vendored at 11.2.5 until upstream 11.2.7 adopted
`tinyglobby` with absolute paths; Valaxy now depends on the npm release directly.
