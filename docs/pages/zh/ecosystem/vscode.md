---
title: VS Code 扩展
categories:
  - ecosystem
---

[Valaxy VS Code 扩展](https://marketplace.visualstudio.com/items?itemName=yunyoujun.valaxy) 在编辑器中提供文章列表和本地站点预览，帮助你编写和管理博客文章。它是 [Valaxy 项目](/zh/guide/getting-started)的可选辅助工具。

- [从 Visual Studio Marketplace 安装](https://marketplace.visualstudio.com/items?itemName=yunyoujun.valaxy)
- [源码与参与贡献](https://github.com/valaxyjs/valaxy-vscode)
- [问题反馈与功能建议](https://github.com/valaxyjs/valaxy-vscode/issues)
- [版本发布记录](https://github.com/valaxyjs/valaxy-vscode/releases)

## 安装 {#安装}

在 VS Code 扩展面板中搜索 `Valaxy`，选择发布者为 **YunYouJun** 的扩展（扩展 ID：`yunyoujun.valaxy`）。如果已配置 `code` 命令，也可以在终端安装：

```bash
code --install-extension yunyoujun.valaxy
```

## 使用 {#usage}

1. 在 VS Code 中打开博客根目录，确保该目录的 `package.json` 在 `dependencies` 或 `devDependencies` 中声明了 `valaxy`。
2. 在集成终端中执行 `pnpm dev`，启动站点开发服务器。
3. 打开一篇 Markdown 文章，点击活动栏中的 Valaxy 图标，查看 **Valaxy Posts** 文章列表和 **Preview** 预览面板。
4. 点击文章以打开源文件；需要刷新预览时，在命令面板中执行 **Valaxy: Preview Refresh**。

## 功能 {#功能}

扩展提供文章列表、文件切换、文章删除，以及运行中的本地站点预览。开发服务器需要手动启动。

## 配置 {#settings}

以下选项配置在 VS Code 工作区设置（`.vscode/settings.json`）中，而非 `valaxy.config.ts`：

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `valaxy.enabled` | `false` | 未通过依赖检测自动启用时，强制启用扩展。 |
| `valaxy.port` | `4859` | 预览连接的本地开发服务器端口。 |
| `valaxy.postsFolder` | `"pages/posts"` | 相对于工作区根目录的文章目录。 |
| `valaxy.confirmDelete` | `false` | 删除文章前是否弹出确认提示。 |

例如，开启删除确认：

```json
{
  "valaxy.confirmDelete": true
}
```

如果开发服务器使用其他端口，请将 `valaxy.port` 设置为终端输出地址中的端口，再刷新预览。

## 兼容性与问题排查 {#compatibility}

扩展代码位于独立的 [valaxyjs/valaxy-vscode 仓库](https://github.com/valaxyjs/valaxy-vscode)。当前 GitHub 最新发布版本为 **0.0.8**，要求 **VS Code 1.77.0 或更高版本**。其开发依赖仍面向 Valaxy 0.14，本文尚未验证该已发布版本与 Valaxy 1.x 的兼容性。

[0.1.0 兼容性 PR](https://github.com/valaxyjs/valaxy-vscode/pull/3) 已加入多工作区、递归扫描、预览路由修复及针对 Valaxy 1.0.0-rc.12 的自动化验证，目前待审查和发布；本页的使用方式与限制描述仍以 0.0.8 为准。后续进展请参阅 [Roadmap](https://github.com/valaxyjs/valaxy-vscode/issues/1)。

- **未出现 Valaxy 面板**：请直接打开博客根目录。当前实现仅检测第一个工作区文件夹，即使设置了 `valaxy.enabled`，也要求目录中存在 `package.json`。调整项目配置后可重新加载 VS Code 窗口。
- **文章未显示**：检查 `valaxy.postsFolder` 指向的目录是否存在。初始化时只读取该目录下的 `.md` 文件，不会递归加载已有子目录中的文章。
- **预览不可用**：确认开发服务器已启动，且端口配置一致；打开一篇 Markdown 文章后刷新预览。也可以直接在浏览器中访问本地站点。

扩展相关问题请提交至[扩展仓库的 Issues](https://github.com/valaxyjs/valaxy-vscode/issues)，附上 VS Code、扩展和 Valaxy 版本、复现步骤及相关日志。

## 与 DevTools 的关系 {#devtools}

扩展聚焦于编辑器原生文件导航和预览入口；Valaxy DevTools 在开发服务器运行时提供内容、Frontmatter、配置和合集的可视化管理。扩展的基础功能应保持独立于 DevTools。后续可在明确公开的发现与认证协议后增加“打开 DevTools”入口，当前无需直接接入其内部 RPC 接口。
