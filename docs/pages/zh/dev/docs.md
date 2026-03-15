---
title: 参与文档
categories:
  - dev
end: false
---

## 文档编写规范 {#docs-writing}

Valaxy 正在为 1.0 的发布做准备，我们很期待您参与文档的撰写与翻译。

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

