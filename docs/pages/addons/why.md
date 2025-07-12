---
title:
  en: Why Addon?
  zh-CN: 为什么需要插件？
categories:
  - addon
---

::: zh-CN
我们需要一个插件系统允许用户仅使用/快速加载部分功能。
:::

::: en
We need a plugin system that allows users to use/load only certain features quickly.
:::

## 命名规范 {lang="zh-CN"}

## Naming conventions {lang="en"}

::: zh-CN
插件名称：`valaxy-addon-<name>`。

> Add-on 相比 Plug-in 通常包含对界面造成修改，以及仅在某特定平台下适用的含义。
> 譬如 Edge 插件商店（Add-on Store），Slidev 等使用 Addon 命名。
>
> - [Difference Between Add-on and Plug-in](http://www.differencebetween.net/technology/difference-between-add-on-and-plug-in/)
>
> Valaxy 本身完全支持使用 Vite 与 Vue 生态插件。
> 除此之外，我们可能还需要支持一些针对 Valaxy 并（在 Vite/Vue 插件运行前）可控制整个流程的插件。
>
> 此时，Addon 的 API 仅仅适用于 Valaxy 平台。
:::

::: en
Plugin name: `valaxy-addon-<name>`.

> Add-on, compared to Plug-in, typically implies modifications to the user interface, as well as being applicable only on a specific platform.
> For example, the Edge Add-on Store, Slidev, and others use the naming convention "Addon".
>
> - [Difference Between Add-on and Plug-in](http://www.differencebetween.net/technology/difference-between-add-on-and-plug-in/)
>
> Valaxy fully supports the use of Vite and Vue ecosystem plugins.
> In addition, we may also require support for some plugins that are specific to Valaxy, which can control the entire process before the Vite/Vue plugins are executed.
>
> In this scenario, the Addon API is only applicable to the Valaxy platform.
:::

## 说明 {lang="zh-CN"}

## Explanation {lang="en"}

::: zh-CN
插件可以做什么？

譬如制作一个 Live2D 挂件，一个全局音乐播放器，或是修改 Vite 以及内置插件的一些配置等。

它用于补充 Vite/Vue 插件无法做到或加载配置繁琐的内容。
:::

::: en
What can addons do?

For example, they can create a Live2D widget, a global music player, or modify some configurations of Vite and its built-in plugins.

Addons are used to complement what Vite/Vue plugins cannot achieve or to simplify complicated configurations.
:::
