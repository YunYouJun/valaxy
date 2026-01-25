---
title:
  en: AI-Assisted Development
  zh-CN: AI 辅助开发
categories:
  - dev
---

::: zh-CN
Valaxy 通过 [Claude Code](https://claude.com/code) 支持 AI 辅助开发工作流，使项目贡献变得更加简单。
:::

::: en
Valaxy supports AI-assisted development workflows through [Claude Code](https://claude.com/code), making it easier to contribute to the project.
:::

## 环境配置 {lang="zh-CN"}

## Setup {lang="en"}

::: zh-CN
仓库在 `.claude/commands/` 目录中包含了自定义的 Claude Code 命令，用于简化常见的开发任务。
:::

::: en
The repository includes custom Claude Code commands in `.claude/commands/` to streamline common development tasks.
:::

## 可用命令 {lang="zh-CN"}

## Available Commands {lang="en"}

### 修复 GitHub Issues {lang="zh-CN"}

### Fix GitHub Issues {lang="en"}

::: zh-CN
自动分析并修复 GitHub issues：
:::

::: en
Automatically analyze and fix GitHub issues:
:::

```bash
/fix-github-issue 1234
```

::: zh-CN
此命令将会：

1. 使用 GitHub CLI 获取 issue 详情
2. 分析问题描述
3. 搜索相关代码文件
4. 实现必要的修改
5. 运行测试验证修复
6. 确保代码质量（代码检查、类型检查）
7. 创建描述性的提交
8. 推送更改并创建 Pull Request

**示例：**

```bash
/fix-github-issue 628
```

这将自动修复 issue #628，包括：
- 读取 issue 描述
- 找到受影响的组件
- 实现修复
- 运行测试
- 创建带有适当描述的 PR
:::

::: en
This command will:

1. Fetch the issue details using GitHub CLI
2. Analyze the problem description
3. Search for relevant code files
4. Implement the necessary changes
5. Run tests to verify the fix
6. Ensure code quality (linting, type checking)
7. Create a descriptive commit
8. Push changes and create a pull request

**Example:**

```bash
/fix-github-issue 628
```

This will automatically fix issue #628 by:
- Reading the issue description
- Finding affected components
- Implementing the fix
- Running tests
- Creating a PR with proper description
:::

## CLAUDE.md

::: zh-CN
仓库根目录包含 `CLAUDE.md` 文件，提供：

- 基本开发命令
- 架构概览
- 关键模式和约定
- 项目特定说明

该文件帮助 Claude Code 理解代码库结构和开发工作流。
:::

::: en
The repository includes a `CLAUDE.md` file at the root that provides:

- Essential development commands
- Architecture overview
- Key patterns and conventions
- Project-specific notes

This file helps Claude Code understand the codebase structure and development workflow.
:::

## 最佳实践 {lang="zh-CN"}

## Best Practices {lang="en"}

::: zh-CN
使用 AI 辅助开发时：

1. **审查更改**：提交前务必审查 AI 做出的更改
2. **充分测试**：确保测试通过并手动验证关键更改
3. **理解代码**：不要只是接受更改 - 理解更改了什么以及为什么
4. **迭代优化**：与 AI 迭代协作以优化解决方案
5. **遵循约定**：AI 会遵循现有代码模式，但要验证一致性
:::

::: en
When using AI-assisted development:

1. **Review Changes**: Always review the changes made by AI before committing
2. **Test Thoroughly**: Ensure tests pass and manually verify critical changes
3. **Understand the Code**: Don't just accept changes - understand what was changed and why
4. **Iterative Refinement**: Work with the AI iteratively to refine solutions
5. **Follow Conventions**: The AI will follow existing code patterns, but verify consistency
:::

## 创建自定义命令 {lang="zh-CN"}

## Creating Custom Commands {lang="en"}

::: zh-CN
你可以为常见任务创建自定义命令：

1. 在 `.claude/commands/` 中创建新文件
2. 使用描述性命名（例如 `add-feature.md`）
3. 编写 Claude Code 要遵循的指令

**示例命令结构：**

```markdown
请实现新功能：$ARGUMENTS。

遵循以下步骤：
1. 分析需求
2. 设计解决方案
3. 实现代码
4. 编写测试
5. 更新文档
```
:::

::: en
You can create custom commands for common tasks:

1. Create a new file in `.claude/commands/`
2. Name it descriptively (e.g., `add-feature.md`)
3. Write instructions for Claude Code to follow

**Example command structure:**

```markdown
Please implement a new feature: $ARGUMENTS.

Follow these steps:
1. Analyze requirements
2. Design the solution
3. Implement the code
4. Write tests
5. Update documentation
```
:::

## 提示 {lang="zh-CN"}

## Tips {lang="en"}

::: zh-CN
- 使用 `/help` 查看所有可用命令
- AI 可以访问完整的代码库上下文
- 命令可以通过 `$ARGUMENTS` 接受参数
- AI 会遵循 `CLAUDE.md` 和现有代码的模式
- 可以使用 GitHub CLI (`gh`) 进行 GitHub 操作
:::

::: en
- Use `/help` to see all available commands
- The AI has access to the full codebase context
- Commands can accept arguments via `$ARGUMENTS`
- AI will follow patterns from `CLAUDE.md` and existing code
- GitHub CLI (`gh`) is available for GitHub operations
:::

## 局限性 {lang="zh-CN"}

## Limitations {lang="en"}

::: zh-CN
- AI 建议应由人工审查
- 复杂的架构决策可能需要人工规划
- 安全敏感的更改需要额外审查
- 部署前务必在本地环境测试
:::

::: en
- AI suggestions should be reviewed by humans
- Complex architectural decisions may need manual planning
- Security-sensitive changes require extra scrutiny
- Always test in a local environment before deploying
:::

---

::: zh-CN
**注意**：AI 辅助开发是提高生产力的工具，而非替代人工判断。务必审查和理解所做的更改。
:::

::: en
**Note**: AI-assisted development is a tool to enhance productivity, not replace human judgment. Always review and understand the changes made.
:::
