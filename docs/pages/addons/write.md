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
