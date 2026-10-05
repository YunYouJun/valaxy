---
title: AI 辅助开发
categories:
  - dev
---

Valaxy 目前使用 **Codex** 辅助开发核心框架、主题、插件与文档。本页介绍如何让 Codex 理解仓库约定、完成范围明确的修改，并交付可以复现的验证结果。

本文面向 **Valaxy 仓库贡献者**。如果你只是想创建博客、写文章或修改站点配置，请先阅读 [快速开始](/zh/guide/getting-started)。

## 准备开发环境 {#setup}

准备 Node.js `>=22.12.0`，并使用根目录 `package.json` 的 `packageManager` 指定的 pnpm 版本。Valaxy 是 pnpm workspace，所有仓库命令都在项目根目录执行：

```bash
git clone https://github.com/YunYouJun/valaxy.git
cd valaxy
pnpm install
pnpm build
```

`pnpm build` 按顺序构建共享工具、核心框架和 DevTools，首次运行文档或示例站点前需要完成这一步。

在 Codex 中打开这个仓库目录并开始任务。使用终端时，先按 [Codex CLI 官方文档](https://learn.chatgpt.com/docs/codex/cli)完成安装与登录，再在仓库根目录执行：

```bash
codex
```

可以先发送一个只读任务，确认工作目录和项目约定：

```text
请读取 AGENTS.md 和 package.json，概述仓库结构、包管理器、构建与测试命令。
先查看当前 Git 状态，说明已有改动；这一步只做阅读，不修改文件。
```

## 项目约定：AGENTS.md {#agents-md}

根目录的 [AGENTS.md](https://github.com/YunYouJun/valaxy/blob/main/AGENTS.md) 是 Codex 在本仓库中的开发指南，包含包结构、配置与路由流程、构建顺序、测试命令和发布流程。

Codex 会读取适用的 `AGENTS.md` 指令；全局和目录级指令的发现与优先级见 [官方说明](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。一次任务的目标、修改范围和验收标准仍应在对话里写清楚。

维护项目约定时，把可复用的规则写进 `AGENTS.md`，具体命令与根目录 `package.json` 保持一致。任务中的临时路径、某次报错和检查结果则放在对应的任务记录中。

## 用自然语言描述任务 {#available-commands}

一个可执行的任务应包含：**目标、相关上下文、修改范围和验收标准**。提供具体文件、问题链接、复现步骤、日志或截图，让 Codex 从这些证据开始定位。

### 修复 GitHub Issue {#fix-github-issues}

将下面的占位内容替换成实际问题：

```text
请修复这个 Valaxy issue：<issue URL>。

先读取 AGENTS.md、issue 描述和讨论，按其中的步骤复现问题。
定位原因后做范围明确的修复，并为行为缺陷添加能证明修复有效的回归测试。
保留工作区已有改动，运行受影响部分的测试和相关仓库检查。

交付：原因说明、改动摘要、验证命令与结果，以及仍未解决的问题。
本轮保留本地改动，不提交、不推送、不创建 PR。
```

如果任务环境没有 GitHub 访问能力，直接粘贴问题描述、复现步骤和相关日志。需要提交、推送或创建 PR 时，在任务中明确要求，并说明目标分支。

### 修改文档或主题 {#docs-and-themes}

```text
请更新 docs/pages/zh/guide/getting-started.md 及对应英文文档。
先对照 create-valaxy 和模板的实际实现，修正过时说明。
保留仍然有效的信息，确保示例命令、配置文件名和输出一致。
启动文档预览，检查中英文页面、代码块和站内链接，并运行相关检查。
```

主题任务还应说明目标主题、参考效果和需要验证的页面。例如，修改 Yun 首页后，检查桌面和移动端布局，并确认文章导航与生产构建仍然正常。

### 验证完整使用流程 {#verify-workflow}

跨越脚手架、依赖安装和构建的任务，需要从干净项目验证：

```text
验证 Valaxy 从创建博客到首次生产构建的完整体验。
使用当前仓库打包产物，在独立临时目录创建博客，按快速开始完成安装、启动、
添加文章、修改站点配置和生产构建。
记录无法照做、说明过时和运行失败的问题，修复后重新生成干净项目复验。
检查首页、文章页、构建产物，并交付可复现的验收记录。不发布版本。
```

仓库已有对应验收入口：

```bash
# 首次运行前安装测试浏览器
pnpm exec playwright install chromium
pnpm test:onboarding
```

它会构建并打包当前仓库产物，在临时目录完成博客全流程，保存日志、截图和 `test-results/onboarding/record.json`。只有全部验收通过才更新快速开始中的启动日志示例；失败结果应保留并如实说明。

## 按改动范围选择检查 {#best-practices}

| 改动范围 | 常用检查 |
| --- | --- |
| 工具函数、Markdown 或配置行为 | 先运行相关测试文件，例如 `pnpm exec vitest run test/create-valaxy.test.ts`；需要完整单元测试时运行 `pnpm test --run` |
| TypeScript / Vue 代码 | `pnpm lint`、`pnpm typecheck`，以及受影响功能的测试 |
| 核心包或 CLI | `pnpm build`，再运行相关示例或 CLI 命令 |
| 文档 | `pnpm docs:dev` 预览；检查中英文对应页面、链接和代码示例，运行 `pnpm docs:build` 验证静态产物 |
| Yun 主题 | `pnpm demo` 预览、`pnpm demo:build` 构建，按修改范围验证桌面和移动端 |
| 脚手架或首次使用流程 | `pnpm test:onboarding`，从打包产物验证依赖安装、启动与生产构建 |

根据修改选择必要的检查。完成任务时列出实际执行的命令、通过或失败的结果，以及未执行的检查；有失败时保留日志和复现步骤。

## 复用项目技能 {#creating-custom-commands}

仓库维护了两份技能文档，可在任务中明确要求 Codex 阅读：

- [skills/valaxy/SKILL.md](https://github.com/YunYouJun/valaxy/blob/main/skills/valaxy/SKILL.md)：博客配置、文章、框架、主题与插件开发。
- [skills/valaxy-theme/SKILL.md](https://github.com/YunYouJun/valaxy/blob/main/skills/valaxy-theme/SKILL.md)：从需求生成或改造主题，并验证可运行的主题与示例站点。

例如：

```text
先阅读 skills/valaxy-theme/SKILL.md，再根据以下需求改造主题：……
验收时提供可运行的示例，检查首页、文章页和移动端，并说明如何预览。
```

## 其他 AI 工具 {#claudemd}

仓库仍保留 `CLAUDE.md` 和 `.claude/commands/fix-github-issue.md`，供 Claude Code 工作流使用。旧文档中的 `/fix-github-issue` 来自该命令文件，**不是 Codex 内置命令**。

使用其他工具时，同样可以明确要求它阅读 `AGENTS.md` 和相关技能文档，并核对当前代码与 `package.json`。本页的任务示例也可以直接作为普通提示词使用。
