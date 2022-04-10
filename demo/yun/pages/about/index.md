---
title: 关于
---

Hello，我是[云游君](https://github.com/YunYouJun)，我正在开发 Valaxy 以重构我的[博客](https://www.yunyoujun.cn)。

同时它也会是一个功能强大、启动迅速、使用便捷的静态博客框架。

More info see [Valaxy](https://github.com/YunYouJun/valaxy).

---

[**「Steins;Gate」**](https://zh.wikipedia.org/wiki/%E5%91%BD%E9%81%8B%E7%9F%B3%E4%B9%8B%E9%96%80)的世界性变动率是：<span font="mono">1.048596</span>。

Valaxy 的默认启动端口号截取自其中小数点后第二位开始的 <span font="mono">4859</span>。

**「無限遠点のアークライト」**直译为**无限远点的弧光灯**，在翻译时[维基百科](https://zh.wikipedia.org/wiki/%E5%91%BD%E9%81%8B%E7%9F%B3%E4%B9%8B%E9%96%80)上显示为 **「无限远点的牵牛星」**，而[科学 ADV 中文百科](https://sci-adv.cc/wiki/%E5%B9%BF%E6%92%AD%E5%89%A7:%E6%97%A0%E9%99%90%E8%BF%9C%E7%82%B9%E7%9A%84%E5%BC%A7%E5%85%89%E7%81%AF)则译为 **「无限远点的织女星」**。

命运石之门 0 中，真有理将凶真打回 **「命运石之门」** 世界线的行动称之为 **「织女星计划」**。
而 25 年后，凶真寻找真有理的计划则为 **「牵牛星计划」**。

因此我决定将 Valaxy 开发计划称之为 **「银河计划 - Galaxy Plan」**。

---

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
  - val: 瓦尔（基里）- 女武神

我的博客此前构建于 Hexo 之上，但随着现代前端框架的不断进步，Hexo 的工作流与开发体验已开始落后。
因此我决定基于 Vue 与 Vite 构建新的 [hexo-theme-yun](https://github.com/YunYouJun/hexo-theme-yun/)。

此前我的目的是使用现代前端框架重构主题，但与 Hexo 的脱离也意味着我要重新完成 Hexo 本身做的一些渲染工作。
那么如果我这么做了，为什么不顺便开发一个专为博客打造的静态站点生成器呢？
因此，我决定将其叫做 Valaxy。

这是重复造轮子吗？我认为不是。

### 为什么不是 Hexo/Hugo/Jekyll ?

> Wordpress/Typecho 等是动态博客，因此不在考虑范围内。

我非常需要现代前端框架提供的开发热重载与 PJAX 体验，以及 TypeScript 的类型提示，但 Hexo 似乎已经有些积重难返，基于此来做一些工作将会束手束脚。

Hugo 也是很棒的静态站点生成器，但是我并没有使用 Go 的需求。当然在打包时所使用的 ESBuild 正是基于 Go 实现。但这并不需要我操心。

Jekyll 算是元老，但同样我并不使用 Ruby，且它似乎并不便捷，也同样存在一些开发体验的问题。
GitHub 为其提供了原声支持是一大优势，但我打算类似使用 GitHub Actions 来达成该方面近乎一致的体验。

最后，我有一些尝试想要实现。见[重新构想博客框架(Todo)]。
譬如，可以提供一种主题商店，用户仅需在 GitHub Repo 中存放自己的文章。
在主题商店，填写自己的 Repo 地址，选中主题切换即可在线预览内容效果。（这完全可以做到，只需要动态纯前端获取 Markdown 内容并渲染即可）
而用户想要应对 SEO 时，则可再将其渲染为静态页面。我也将会为此提供一个一键可用的 GitHub Actions 脚本。

...

## Thanks

💗 Valaxy 的实现基于或参考了以下项目：

- [Vue](https://github.com/vuejs/core)
- [VueUse](https://github.com/vueuse/vueuse)
- [Vite](https://github.com/vitejs/vite)
- [VitePress](https://github.com/vuejs/vitepress)
- [Vitesse](https://github.com/antfu/vitesse)
- [Slidev](https://github.com/slidevjs/slidev)

## [Sponsors](https://sponsors.yunyoujun.cn)

❤️ 也感谢以下赞助者们的支持！

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/YunYouJun/sponsors/public/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/YunYouJun/sponsors/public/sponsors.svg'/>
  </a>
</p>
