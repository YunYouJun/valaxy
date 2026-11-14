---
title: Schema.org 和 OPG 用于 SEO
categories:
  - third
top: 0
---

::: tip
[OpenGraph or Scheme.org](https://stackoverflow.com/questions/6402528/opengraph-or-schema-org)

- [The Open Graph protocol](https://ogp.me/)
- [Schema.org](https://schema.org/)
:::

采用 [Schema.org](https://schema.org/) 标准，可以让搜索引擎更好地理解网站内容，从而提高网站在搜索结果中的排名。

基于 [@unhead/schema-org](https://unhead.unjs.io/docs/typescript/schema-org/guides/get-started/overview) 实现。

- Identity 采用了 Person (Personal Website or Blog)

> [Person | @unhead/schema.org](https://unhead.unjs.io/docs/typescript/schema-org/guides/recipes/identity#person)

人物的 `url` 在 `author.link` 为绝对地址时使用该链接，否则使用站点 `url`。填写的 `author.email` 会公开在 RSS 和作者的结构化数据中。框架不会提供默认邮箱。

`WebSite.name` 是站点标题。`WebPage.url` 是当前页面。文章的 Open Graph 类型是 `article`，其他页面是 `website`。分享文案使用 frontmatter `description`；该字段为空时使用纯文本摘要。见[描述与分享卡片](/zh/guide/post#share)。

## Validators {#validators}

- [Google 富媒体搜索结果测试](https://search.google.com/test/rich-results)
- [架构标记验证器](https://validator.schema.org/)

