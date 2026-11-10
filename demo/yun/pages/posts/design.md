---
title: Valaxy 设计原则
date: 2022-03-29
end: false
tags:
  - design
---

## 特点 {lang="zh-CN"}

::: zh-CN
草稿可以留在仓库里，同时不进入公开站点。

在 frontmatter 中添加 `draft: true` 后，开发服务器仍然可以预览这篇文章。生产构建、sitemap、RSS 和 `llms.txt` 会跳过它。需要发布时，去掉这一行即可。

也可以把稿件放在 `pages/_drafts/`，或其他以 `_` 开头的目录中。这些文件不会变成路由。`pages/README.md` 同样不会发布。站点若确实要公开某一类路径，在 `site.config.ts` 中设置 `publishing.underscore` 或 `publishing.readme`。

譬如：
:::

## Features {lang="en"}

::: en
A draft can stay in the repository and stay off the public site.

Add `draft: true` to the frontmatter and the dev server can still preview the page. Production builds, the sitemap, RSS, and `llms.txt` skip it. Remove that line when the page is ready.

You can also keep pages in `pages/_drafts/`, or in any directory whose name starts with `_`. Those files are not routes. `pages/README.md` is not published either. Set `publishing.underscore` or `publishing.readme` in `site.config.ts` when a site needs one of those URLs.

For example:
:::

```markdown
---
draft: true
---
```

::: zh-CN
`draft: true` 适合仍想在开发时打开预览的文章。以 `_` 开头的目录适合整组稿件，默认连开发服务器也不会为它们注册路由。
:::

::: en
`draft: true` fits a page you still want to open while developing. A directory whose name starts with `_` fits a whole set of drafts; the dev server does not register routes for it unless you opt in.
:::
