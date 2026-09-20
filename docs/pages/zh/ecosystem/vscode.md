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

**0.1.0** 的 VSIX 安装包可从 [GitHub Releases](https://github.com/valaxyjs/valaxy-vscode/releases/tag/v0.1.0) 下载，要求 **VS Code 1.85 或更高版本**。Marketplace 发布完成前，请通过扩展面板的 **Install from VSIX…（从 VSIX 安装）** 安装此版本，以使用下文介绍的功能。

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

扩展提供文章列表、文件切换、文章删除，以及运行中的本地站点预览。开发服务器需要手动启动。多根工作区中的各个博客独立识别；文章扫描不依赖开发服务器。

## 配置 {#settings}

以下选项配置在 VS Code 工作区设置（`.vscode/settings.json`）中，而非 `valaxy.config.ts`：

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `valaxy.enabled` | `false` | 强制识别为博客项目，也适用于没有 `package.json` 的文件夹。 |
| `valaxy.port` | `4859` | 预览连接的本地开发服务器端口。 |
| `valaxy.postsFolder` | `"pages/posts"` | 工作区内需要递归扫描的文章目录。 |
| `valaxy.serverUrl` | `""` | 包含站点 base 路径的本地 HTTP(S) 地址，优先于 `valaxy.port`。 |
| `valaxy.confirmDelete` | `true` | 将文章移入回收站前是否弹出确认提示。 |

例如，开启删除确认：

```json
{
  "valaxy.confirmDelete": true
}
```

如果开发服务器使用其他端口，请将 `valaxy.port` 设置为终端输出地址中的端口，再刷新预览。

## 兼容性与问题排查 {#compatibility}

扩展代码位于独立的 [valaxyjs/valaxy-vscode 仓库](https://github.com/valaxyjs/valaxy-vscode)。0.1.0 已针对 **Valaxy 1.0.0-rc.12** 验证，并通过真实 VS Code 1.85 和 stable 扩展宿主测试。扩展自身不打包 Valaxy 运行时，后续进展请参阅 [Roadmap](https://github.com/valaxyjs/valaxy-vscode/issues/1)。

- **未出现 Valaxy 面板**：请使用受信任的文件系统工作区。每个博客文件夹需声明 `valaxy` 依赖，或在该文件夹设置 `valaxy.enabled`。配置错误可在 **Valaxy** 输出通道查看。
- **文章未显示**：检查 `valaxy.postsFolder`。目录不存在时列表为空，创建目录后会重新扫描。Markdown 文件会递归读取，隐藏目录和符号链接目录会跳过；Frontmatter 格式错误会单独报告，不阻断其他文章。
- **预览不可用**：确认服务器已启动且端口一致。站点有 base 路径时可设置 `valaxy.serverUrl`，如 `http://localhost:4859/blog/`，再刷新预览或执行 **Valaxy: Open Browser Preview**。
- **自定义路由不匹配**：支持常规嵌套路径、点号嵌套和 `index.md`。自定义路由钩子、动态路由和 `pages` 外的文章需在浏览器中导航。Remote SSH/Containers 转发仍需手动验证。

扩展相关问题请提交至[扩展仓库的 Issues](https://github.com/valaxyjs/valaxy-vscode/issues)，附上 VS Code、扩展和 Valaxy 版本、复现步骤及相关日志。

## 与 DevTools 的关系 {#devtools}

扩展聚焦于编辑器原生文件导航和预览入口；Valaxy DevTools 在开发服务器运行时提供内容、Frontmatter、配置和合集的可视化管理。扩展的基础功能应保持独立于 DevTools。后续可在明确公开的发现与认证协议后增加“打开 DevTools”入口，当前无需直接接入其内部 RPC 接口。
