---
title: Why Addon?
categories:
  - addon
---


We need a plugin system that allows users to use/load only certain features quickly.


## Naming conventions


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


## Explanation


What can addons do?

For example, they can create a Live2D widget, a global music player, or modify some configurations of Vite and its built-in plugins.

Addons are used to complement what Vite/Vue plugins cannot achieve or to simplify complicated configurations.
