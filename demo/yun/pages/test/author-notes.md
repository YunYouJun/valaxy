---
title: 从 Hexo 到 Valaxy
lang: zh-CN
comment: false
---

2020 年写旧文时，我用的是 Hexo、`hexo-theme-yun`、GitHub Pages 和 Travis CI[^author-ci]。

## 当年的构建和部署

文章存进 Git，主题在构建时把 Markdown 变成页面。每次更新文章，我会把源码和配置提交到仓库，等 CI 跑完以后再打开博客确认。

GitHub Pages 负责托管生成的页面。文章、主题和构建配置各有自己的更新节奏，想回看某一次部署时，可以从仓库记录找到当时的版本。

## 后来做了 Valaxy

后来我自己动手做了 [**Valaxy**](https://valaxy.site/zh/guide/why)，现在我的博客就跑在它上面[^author-valaxy]。

旧文章还留着。当年是怎么把博客搭起来的，后来又做了哪些调整，都可以沿着正文慢慢回看。

## 继续更新这篇旧文

版本提示和部署步骤可以随工具更新。当年的配置都跟文章一起提交了[^ci-archive]。

[^author-ci]: **多年后补记。** 当时我对 `Travis CI` 最大的期待，就是那颗绿灯早点亮。

    后来换成 [Valaxy](https://valaxy.site/zh/guide/why)，这段也留着，算是给当年的建站方式存个档。

[^author-valaxy]: 现在回看，动手做框架的起点，还是想把自己的博客改得更顺手。

[^ci-archive]: 这里的配置指仓库里当时的 CI 配置文件。
