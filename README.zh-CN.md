# Valaxy

📄 Vite & Vue powered static blog generator.

[English](README.md) | 简体中文

## 特性

- 现代博客框架，一些新的尝试
- Vue & Vite 热加载开发体验
- 动态预览
- 一键使用
- ...

## Why Valaxy?

- V + galaxy = Valaxy
  - V: it based on vue + vite
  - galaxy: 我希望它可以像一个平台工具，承载大家的博客，如同银河系一般美丽
  - xy: 有点像小云（Xiao Yun）的缩写（乌拉小云）

我的博客此前构建于 Hexo 之上，但随着现代前端框架的不断进步，Hexo 的工作流与开发体验已开始落后。
因此我决定基于 Vue 与 Vite 构建新的 [hexo-theme-yun](https://github.com/YunYouJun/hexo-theme-yun/)。

此前我的目的是使用现代前端框架重构主题，但与 Hexo 的脱离也意味着我要重新完成 Hexo 本身做的一些渲染工作。
那么如果我这么做了，为什么不顺便开发一个专为博客打造的静态站点生成器呢？
因此，我决定将其叫做 Valaxy。

这是重复造轮子吗？我认为不是。

### 为什么不是 Hexo/Hugo/Jekyll ?

> Wordpress/Typecho 等是动态博客，因此不在考虑范围内。

我需要现代前端框架提供的开发热重载与 PJAX 体验，以及 TypeScript 的类型提示，但 Hexo 似乎已经有些积重难返，基于此来做一些工作将会束手束脚。

Hugo 也是很棒的静态站点生成器，但是我并没有使用 Go 的需求。当然在打包时所使用的 ESBuild 正是基于 Go 实现。但这并不需要我操心。

Jekyll 算是原来，但同样我并不使用 Ruby，且它似乎并不便捷，也同样存在一些开发体验的问题。
GitHub 为其提供了原声支持是一大优势，但我打算类似使用 GitHub Actions 来达成该方面近乎一致的体验。

最后，我有一些尝试想要实现。
譬如，可以提供一种主题商店，用户仅需在 GitHub Repo 中存放自己的文章。
在主题商店，填写自己的 Repo 地址，选中主题切换即可在线预览内容效果。（这完全可以做到，只需要动态纯前端获取 Markdown 内容并渲染即可）
而用户想要应对 SEO 时，则可再将其渲染为静态页面。我也将会为此提供一个一键可用的 GitHub Actions 脚本。
