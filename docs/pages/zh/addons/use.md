---
title: 使用插件
categories:
  - addon
---

## 在 DevTools 中管理插件 {#devtools}

运行 `valaxy dev`，在 Valaxy DevTools 打开「插件」。插件橱窗与官网共用目录，支持名称／描述／标签搜索、官方／社区筛选，以及 npm、源码与使用文档入口。「已安装」列出项目直接依赖和运行中的主题插件，即使它没有提供 DevTools 面板，也会显示。

在插件详情选择「安装插件」，检查固定版本和命令后确认。安装使用 pnpm 并禁用安装脚本；完成后请按文档配置 `valaxy.config.ts` 的 `addons` 和必要参数，再重启预览。已安装不代表已启用。

「移除插件」会预览依赖和静态配置变更，确认后更新包清单与锁文件。常见的字符串、对象和直接工厂调用可自动清理；动态配置、其他源码中的引用或主题提供的间接依赖需要先手动处理。正文及媒体文件保留。执行日志和错误会显示在页面中；切换页面不会重复执行操作。

项目若使用其他包管理器，仍可浏览插件，但请在终端沿用原包管理器操作。安装包需要额外脚本或存在依赖版本要求时，请先阅读对应插件文档。

## How To Use {#how-to-use}

```bash
pnpm add [valaxy-addon-package1] [valaxy-addon-package2]
# npm i [valaxy-addon-package1] [valaxy-addon-package2]
```

使用

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonTest } from 'valaxy-addon-test'

export default defineValaxyConfig({
  addons: [
    // we always recommend to use function, so that you can pass options
    addonTest(),

    'valaxy-addon-package1',
    // pass addon options
    ['valaxy-addon-package2', { global: false }],
  ]
})
```

### Addon With Options {#addon-with-options}

譬如开启 Waline 评论：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

export default defineValaxyConfig({
  // 启用评论
  comment: {
    enable: true
  },
  // 设置 valaxy-addon-waline 配置项
  addons: [
    addonWaline({
      serverURL: 'https://your-waline-url',
    }),
  ],
})
```

