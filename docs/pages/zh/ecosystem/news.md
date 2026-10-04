---
title: 项目动态
description: Valaxy 的重要版本发布、写作工具与插件生态进展。
categories:
  - ecosystem
---

这里汇总 Valaxy 的重要版本与生态进展。功能解读和开发笔记收录在[博客](/zh/posts/)；升级步骤请查看[版本迁移](/zh/migration/version)，完整版本记录见 [GitHub Releases](https://github.com/YunYouJun/valaxy/releases)。

## 2026-10-04 · Valaxy 1.0 正式发布 {#valaxy-1-0}

Valaxy 1.0 是首个稳定版本，继续围绕 Markdown 写作、Vue 组件扩展和静态发布完善博客体验。

- **构建与渲染**：升级至 Vite 8 与 Rolldown，统一使用内置 SSG 引擎；页面、摘要、搜索和 RSS 共用异步 Markdown 渲染。
- **可视化管理**：DevTools 提供文章、配置与插件管理；需要与 AI 工具协作时，可按文档启用本地 MCP 内容编辑。
- **按需扩展**：Mermaid 图表和 Meting 音乐播放器通过独立插件提供，按站点需要启用。

升级前请先确认 Node.js 版本不低于 **22.12.0**，并阅读迁移指南中的配置与插件调整。

[浏览 1.0 发布专题](/zh/release/) · [升级指南](/zh/migration/version#v100) · [1.0.0 发布记录](https://github.com/YunYouJun/valaxy/releases/tag/v1.0.0)

## 2026-10-04 · 写作工具与插件近况 {#ecosystem-roundup}

本次生态整理关注从编辑文章到扩展博客的几个入口：

- **[云栈客户端](/zh/ecosystem/client)**：Valaxy 写作客户端由云栈承接，提供 Web 编辑器与桌面公开预览。支持的平台与功能范围以客户端页面为准。
- **[VS Code 扩展](/zh/ecosystem/vscode)**：0.1.0 已发布，提供文章列表、多根工作区支持与本地站点预览，可从 Marketplace 或 GitHub Releases 安装。
- **[Moments 插件](/zh/addons/official/moments)**：使用 Markdown 记录短内容，以时间线展示，并支持点赞。
- **[与 AI 协作](/zh/guide/work-with-ai)**：了解 DevTools 与可选 MCP 内容服务各自的用途和开启方式。

更多扩展见[官方插件](/zh/addons/official/)。设计取舍与技术实践可继续阅读[博客与开发笔记](/zh/posts/)。

## v0.15.x · 历史动态 {#v015x}

### 破坏性变更 {#break-changes}

Valaxy 在 v0.15 中完全升级至 ESM 模块化，不再支持 CommonJS。

[v0.15.0 发布记录](https://github.com/YunYouJun/valaxy/releases/tag/v0.15.0)
