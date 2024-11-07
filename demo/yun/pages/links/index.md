---
title: 我的小伙伴们
keywords: 链接
description: 云游的小伙伴们
# links: https://friends.yunyoujun.cn/links.json
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
random: true
---

<YunLinks :links="frontmatter.links" :random="frontmatter.random" errorImg="https://cdn.yunyoujun.cn/img/avatar/none.jpg" />
