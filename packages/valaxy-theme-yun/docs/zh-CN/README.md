# valaxy-theme-yun 文档

## 自定义友情链接

新建 `pages/links/index.md` 文件。

您可以在 `frontmatter` 编写链接信息。

- `links`: 友情链接信息（可以是 YAML 数组形式，也可以是一个 JSON 文件链接）
- `random`: 是否随机展示

譬如：

```md
---
title: 我的小伙伴们
keywords: 链接
description: 云游的小伙伴们
links:
  - url: https://www.yunyoujun.cn
    avatar: https://www.yunyoujun.cn/images/avatar.jpg
    name: 云游君
    blog: 云游君的小站
    desc: 希望能成为一个有趣的人。
    email: me@yunyoujun.cn
    color: "#0078e7"
  - url: https://valaxy.site
    avatar: https://valaxy.site/favicon.svg
    name: Valaxy Org
    blog: Valaxy Site
    desc: 下一代静态博客框架
    email: i@valaxy.site
    color: "#6058d9"
# 也可以是一个 JSON 链接
# links: https://friends.yunyoujun.cn/links.json
random: true
---

<YunLinks :links="frontmatter.links" :random="frontmatter.random" />
```
