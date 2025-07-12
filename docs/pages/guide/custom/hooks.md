---
title:
  en: Hooks
  zh-CN: 钩子
categories:
  - custom
end: false
---

::: tip

Valaxy 提供了钩子系统，以便你可以对生命周期的各个阶段进行定制。

:::

## Lifecycle {lang="en"}

## 生命周期 {lang="zh-CN"}

> 钩子的生命周期以排列顺序执行。

### Build Time

| Hook | Arguments | Description |
| ---- | --------- | ----------- |
| `options:resolved` |  | 在 Valaxy 配置解析之后执行。|
| `config:init` |  | 在 Vite 配置初始化（根据 Valaxy Options 进行初始化）之后执行。|
| `build:before` |  | 在构建开始之前执行。|
| `build:done` |  | 在构建完成之后执行。 |

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  hooks: {
    'config:init': () => {
      console.log('config:init')
    },
  }
})
```

### App Client

> TODO: 仅在客户端执行。

| Hook | Arguments | Description |
| ---- | --------- | ----------- |
<!-- | `app:created` | | 在应用程序实例创建之后执行。| -->
