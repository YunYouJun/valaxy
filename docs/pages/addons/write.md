---
title: Write an Addon
categories:
  - addon
end: false

---

## Getting Started

::: tip
**Convention over Configuration**

- Addon: Must start with `valaxy-addon-`.
- Addons are similar to themes, but do less.
- A site can only use one theme, but can use multiple addons.
- Addons do not need to be precompiled, just publish the source files directly.

:::

- `App.vue` If the addon author wants the addon to be globally mounted immediately when used, they can place the content in `valaxy-addon-<name>/App.vue` and set `global: true` in `package.json`.
- `components`: Components placed in the `components` folder will be automatically registered, but not mounted. Users can manually load and use them.

> Documentation is under construction. You can refer to some existing addons in the [Addon Gallery](/addons/gallery).

<!-- How users configure global -->

### Create Addon Template

```bash
pnpm create valaxy
# choose template addon
```

### Using Lifecycle Hooks

As shown in the example, addons can use `valaxy.hook` to mount lifecycle hooks.
This allows you to do things before/after the build and at other points.

> Please refer to [Lifecycle Hooks](/guide/custom/hooks) for more information.

<<< @/../packages/valaxy-addon-test/node/index.ts {11-14} [valaxy-addon-test/node/index.ts]

### Reading Addon Options on the Client {#reading-addon-options}

Addons typically accept user options via `defineAddon(options)` in `valaxy.config.ts`. These options are available at runtime through `useAddonConfig<T>(addonName)`.

`useAddonConfig` is a generic, type-safe composable provided by `valaxy`. It replaces the boilerplate pattern of `useRuntimeConfig()` + `computed()` + manual type assertion.

```ts [client/options.ts]
import type { MyAddonOptions } from '../types'
import { useAddonConfig } from 'valaxy'

export function useMyAddonConfig() {
  return useAddonConfig<MyAddonOptions>('valaxy-addon-my-addon')
}
```

The return value is a `ComputedRef<ValaxyAddon<MyAddonOptions> | undefined>` — it is `undefined` when the addon is not installed. Access the options via `.value?.options`.

```vue [components/MyComponent.vue]
<script lang="ts" setup>
import { useMyAddonConfig } from '../client/options'

const addon = useMyAddonConfig()
// addon.value?.options?.someField
</script>
```

::: tip
`useAddonConfig` must be called inside `<script setup>` or a Vue lifecycle hook (same constraint as any Vue composable).

Theme components can also use `useAddonConfig` directly to read addon options without adding a hard dependency on the addon package. See [Using Addon Config in Themes](/themes/write#using-addon-config-in-themes).
:::
