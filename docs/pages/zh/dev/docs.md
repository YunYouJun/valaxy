---
title: 参与文档
categories:
  - dev
end: false
---

## 文档编写规范 {#docs-writing}

欢迎参与 Valaxy 文档、翻译和博客文章的撰写。

### 内容放在哪里 {#content-placement}

- **[项目动态](/zh/ecosystem/news)**：按日期倒序记录重要版本和生态进展，每条保留简短摘要，链接到文章或文档了解详情。常规补丁变更保留在 [GitHub Releases](https://github.com/YunYouJun/valaxy/releases)。
- **[博客](/zh/posts/)**：收录功能解读、设计取舍与开发笔记。英文文章放在 `docs/pages/posts/`，中文对应文章放在 `docs/pages/zh/posts/`。包含标题、发布日期、标签，并在 `<!-- more -->` 前提供简短导语。
- **[发布专题](/zh/release/)**：集中展示大版本亮点。项目动态链接到专题，避免重复维护整篇介绍。
- **使用指南与[迁移文档](/zh/migration/version)**：持续维护当前有效的使用方法和升级步骤。博客可解释背景，再链接到对应指南。

调整导航名称时保留现有 `/ecosystem/news`、`/posts/` 及其中文路径。历史文章保留原始发布日期；其中的建议过时时，补充带日期的说明。

## 文档组织方式 {#文档组织方式}

Valaxy 文档采用**路径分离**的方式组织中英文内容：

- 英文文档位于 `/docs/pages/` 目录下
- 中文文档位于 `/docs/pages/zh/` 目录下

例如：
```
docs/pages/guide/getting-started.md    # 英文版
docs/pages/zh/guide/getting-started.md # 中文版
```

### 双语容器方式（仅用于特定场景）

某些文档（如博客文章）可能使用双语容器的方式在同一文件中编写中英文：

```md
::: zh-CN
中文内容
:::

::: en
English content
:::
```

更多请参见 [单页 i18n](https://valaxy.site/guide/i18n) 和 [i18n 容器规范](/guide/i18n#container-syntax)。

## 如何翻译 {#如何翻译}

### 1. 创建对应的中文文档

如果你发现某个英文文档还没有中文版本，请在 `/docs/pages/zh/` 下创建对应路径的文件。

例如，要翻译 `/docs/pages/guide/ssr-compat.md`：

1. 创建 `/docs/pages/zh/guide/ssr-compat.md`
2. 复制英文文档的结构
3. 将内容翻译为中文
4. 保持代码示例不变（除非需要中文化注释）

### 2. 保持文档结构一致

- **Frontmatter**：保持相同的 `categories`、`top` 等字段，只翻译 `title`
- **标题层级**：保持与英文版相同的标题结构
- **代码示例**：通常不需要翻译，保持原样
- **链接**：中文文档中的内部链接应指向中文版（如 `/zh/guide/...`）

### 3. 翻译建议

- 专有名词首次出现时可以保留英文，如："SSR（服务端渲染）"
- 保持技术术语的准确性，可参考 [Vue 中文文档](https://cn.vuejs.org/) 的翻译规范
- 代码中的注释可以适当中文化，但变量名、函数名保持英文

## 如何提交 {#如何提交}

使用 GitHub 的 Pull Request 向 valaxy 提交即可。
建议您以一个完整的 md 文件或一个分类翻译为一次提交。

Commit message 请以 `docs:` 开头。

譬如：

- 添加新的中文文档翻译：`docs: add zh translation for ssr-compat`
- 更新现有翻译：`docs: update guide translation`
- 修改错别字：`docs: fix typo in xxx.md`
- 更新英文文档：`docs(en): update getting-started guide`

## 文档预览 {#文档预览}

在提交前，请在本地预览文档：

```bash
# 安装依赖
pnpm install

# 启动文档开发服务器
pnpm docs:dev

# 构建文档（用于检查构建错误）
pnpm docs:build
```

访问 `http://localhost:4859` 查看文档效果，使用右上角的语言切换按钮测试中英文切换。
