---
title: 主题起始模板
---

# 主题起始模板

[valaxy-theme-starter](https://github.com/valaxyjs/valaxy-theme-starter) 提供三个 pnpm workspace：

| 工作区 | 职责 |
| --- | --- |
| `theme/` | 发布到 npm 的主题包 |
| `demo/` | 使用待开发主题的真实演示站 |
| `docs/` | 使用 `valaxy-theme-press` 的主题专属文档 |

运行 `pnpm theme:init` 初始化名称，`pnpm demo` 开发主题，`pnpm docs:dev` 编写文档。`pnpm build:site` 将演示站放在 `/`、文档放在 `/docs/`，组成一次静态部署。部署到其他路径时，同步调整文档 base。

通用的[主题开发机制](/zh/themes/write)、Valaxy 配置和共享 [API 参考](/api/) 由官网维护；主题独有的配置、组件、示例和升级说明放在主题仓库，与功能变更在同一个 PR 中更新。

新主题默认使用 Press 编写文档，演示站继续使用自己的主题。已有 VitePress 文档可以保留，等出现明确迁移收益再调整；新的模板只需维护 Valaxy 一套工具链。

模板的使用指南与部署配置见 [Starter 仓库文档](https://github.com/valaxyjs/valaxy-theme-starter/tree/main/docs)。
