# Why Addon?

我们需要一个插件系统允许用户仅使用/快速加在部分功能。

## 命名规范

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
