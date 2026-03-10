---
title: 与 AI 协作
categories:
  - guide
---


## Agent Skills

::: tip

🧪 实验性：Valaxy Skills 目前为实验性功能，正在积极开发中，欢迎反馈。


:::


[Valaxy Skills](https://github.com/YunYouJun/valaxy/tree/main/skills) 是由 Valaxy 团队维护的 AI Agent Skills。

安装 Skill 后，当你使用 AI Agent 来辅助开发 Valaxy 站点时，它可以自动利用 Valaxy 提供的丰富功能集。

这使得 Agent 能够准确使用 Valaxy 的配置、主题、插件等功能。




### 安装

```bash
npx skills add YunYouJun/valaxy
```


### 使用


#### 使用 Agent 开发 Valaxy 站点

示例提示词：

```txt
创建一个 Valaxy 博客站点：
- 使用 valaxy-theme-yun 主题
- 配置 Algolia 搜索
- 添加 Waline 评论插件
- 启用 llms.txt 输出
- 自定义导航与侧边栏
```

Agent 将自动引用 Valaxy Skills 中的知识来正确配置 `site.config.ts` 和 `valaxy.config.ts`，使用合适的 API（如 `defineSiteConfig`、`defineValaxyConfig`），并遵循 Valaxy 的最佳实践。




## CLAUDE.md


Valaxy 仓库内置了 [CLAUDE.md](https://github.com/YunYouJun/valaxy/blob/main/CLAUDE.md) 文件，用于为 [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) 等 AI 工具提供项目上下文。

该文件包含：

- 项目架构概览（Monorepo 结构、核心包结构）
- 常用命令（开发、构建、测试、Lint）
- 配置流程（Config Merging、Roots System、Virtual Modules）
- 主题与插件开发指南
- 测试策略与部署方式

如果你使用 Claude Code 或其他支持 `CLAUDE.md` 的 AI 工具来开发 Valaxy，它将自动读取该文件以获得更准确的上下文理解。




## llms.txt


Valaxy 内置了 [llms.txt](https://llmstxt.org/) 支持，可以为你的博客生成 AI 可读的纯文本内容。

在 `site.config.ts` 中启用：

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  llms: {
    enable: true,
  },
})
```

启用后，Valaxy 将自动生成：

- `/llms.txt` — 站点索引，包含所有文章的标题、描述和链接
- `/llms-full.txt` — 完整内容，包含所有文章的全文（可通过 `fullText: false` 关闭）
- `/posts/xxx.md` — 每篇文章的原始 Markdown 文件（可通过 `files: false` 关闭）

### 配置选项

```ts
export default defineSiteConfig({
  llms: {
    enable: true,
    // 是否生成 llms-full.txt（默认 true）
    fullText: true,
    // 是否为每篇文章生成独立的 .md 文件（默认 true）
    files: true,
    // 自定义提示词（添加到 llms.txt 的引用块部分）
    prompt: '',
    // 要包含的文件 glob 模式（相对于 pages/ 目录，默认 ['posts/**/*.md']）
    include: ['posts/**/*.md'],
  },
})
```

### CLI 命令

你也可以单独生成 llms.txt 相关文件：

```bash
npx valaxy llms
```



