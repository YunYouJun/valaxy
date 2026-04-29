---
title: 编写一个插件
categories:
  - addon
end: false

---

## 开始编写 {#开始编写}

::: tip
**约定大于配置**

- 插件：`Addon`，须以 `valaxy-addon-` 开头。
- 插件与主题类似，但做的事情更少。
- 一个站点只能使用一个主题，但可以使用多个插件。
- Addon 无需预编译，直接发布源文件即可。

:::

- `App.vue` 如果插件作者希望插件被使用时立刻全局挂载，可以将内容放置于 `valaxy-addon-<name>/App.vue` 中，并设置 `package.json` 中 `global: true`。
- `components`: 放置于 `components` 文件夹下的组件将会被自动注册，但不会被挂载。用户可以手动加载使用。

> 文档正在施工中，您可以参照 [插件橱窗](/zh/addons/gallery) 一些已有的插件。

<!-- 用户如何配置 global -->

### 创建插件模板 {#创建插件模板}

```bash
pnpm create valaxy
# choose template addon
```

### 使用生命周期钩子 {#使用生命周期钩子}

如示例所示，插件可以使用 `valaxy.hook` 来挂载生命周期钩子。
实现在构建前/后以及其他节点做一些事情。

> 请参考 [生命周期钩子](/zh/guide/custom/hooks) 了解更多。

<<< @/../packages/valaxy-addon-test/node/index.ts {11-14} [valaxy-addon-test/node/index.ts]

### 在客户端读取插件选项 {#reading-addon-options}

插件通常通过 `valaxy.config.ts` 中的 `defineAddon(options)` 接受用户选项。在客户端运行时，可以通过 `useAddonConfig<T>(addonName)` 获取这些选项。

`useAddonConfig` 是 `valaxy` 提供的通用类型安全 composable，替代了以往 `useRuntimeConfig()` + `computed()` + 手动类型断言的模板代码。

```ts [client/options.ts]
import type { MyAddonOptions } from '../types'
import { useAddonConfig } from 'valaxy'

export function useMyAddonConfig() {
  return useAddonConfig<MyAddonOptions>('valaxy-addon-my-addon')
}
```

返回值类型为 `ComputedRef<ValaxyAddon<MyAddonOptions> | undefined>` —— 当插件未安装时为 `undefined`。通过 `.value?.options` 访问选项。

```vue [components/MyComponent.vue]
<script lang="ts" setup>
import { useMyAddonConfig } from '../client/options'

const addon = useMyAddonConfig()
// addon.value?.options?.someField
</script>
```

::: tip
`useAddonConfig` 必须在 `<script setup>` 或 Vue 生命周期钩子内调用（与其他 Vue composable 约束相同）。

主题组件也可以直接使用 `useAddonConfig` 读取插件选项，无需对插件包产生硬依赖。参见[在主题中使用插件配置](/zh/themes/write#using-addon-config-in-themes)。
:::

