---
title: Write a Addon
title_zh-CN: 编写一个插件
categories:
  - Addon
---

## 开始编写

::: tip
**约定大于配置**

- 插件与主题类似，但做的事情更少。
- 一个站点只能使用一个主题，但可以使用多个插件。
- Addon 无需预编译，直接发布源文件即可。

:::

- [ ] `App.vue` 如果插件作者希望插件被使用时立刻全局挂载，可以将内容放置于 `valaxy-addon-<name>/App.vue` 中，并设置 `package.json` 中 `global: true`。

- `components`: 放置于 `components` 文件夹下的组件将会被自动注册，但不会被挂载。用户可以手动加载使用。

用户如何配置 global
