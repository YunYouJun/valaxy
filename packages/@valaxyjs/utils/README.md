# @valaxyjs/utils

Extract common utilities from ValaxyJS core.

```bash
# You can use it alone.
pnpm add @valaxyjs/utils
```

## Addon catalog

The documentation gallery and DevTools marketplace share the catalog in
[`src/constants/addons.ts`](./src/constants/addons.ts). Add or update entries there;
the TypeScript constant checks every entry against `AddonCatalogEntry`.
Types live in `src/types/addons.ts`, and localization helpers live in `src/addons.ts`.

```ts
import { addons, localizeAddon } from '@valaxyjs/utils'

const localizedAddons = addons.map(addon => localizeAddon(addon, 'zh-CN'))
```

From the repository root, run `pnpm --filter @valaxyjs/utils build` followed by
`pnpm validate:addons` to validate the shared catalog and its documentation links.
