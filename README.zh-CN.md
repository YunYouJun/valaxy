<h1 align="center">
<a href="https://valaxy.site">Valaxy</a>
</h1>

<p align="center">
🌌 下一代静态博客框架 (Beta).
</p>

<pre align="center">
🧪 开发中
</pre>

<p align="center">
<a href="https://www.npmjs.com/package/valaxy" rel="nofollow"><img src="https://img.shields.io/npm/v/valaxy?color=0078E7" alt="NPM version"></a>
<a href="https://github.com/YunYouJun/valaxy/actions/workflows/release.yml"><img src="https://github.com/YunYouJun/valaxy/actions/workflows/release.yml/badge.svg" alt="Release"></a>
<a href="https://discord.gg/nd3mPkU5j8" target="_blank">
<img alt="Discord" src="https://img.shields.io/discord/752821465891733574?color=%234960ea&logo=discord">
</a>
</p>

- [English](./README.md) | **简体中文**
- [English Docs](https://valaxy.site/?lang=en) | [中文文档](https://valaxy.site/?lang=zh-CN)
- [Demo](https://yun.valaxy.site): <small>with [valaxy-theme-yun](./packages/valaxy-theme-yun/)</small>

## 使用

### 在线上尝试

[![StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/valaxy)

### 在本地初始化项目

只需运行以下命令来初始化博客：

```bash
# pnpm (推荐)
pnpm create valaxy
# npm
# npm init valaxy
# yarn
# yarn create valaxy
```

示例：[demo/yun](./demo/yun/)

## 功能

- ⚡️ [Vue 3](https://github.com/vuejs/vue-next), [Vite 5](https://github.com/vitejs/vite), [pnpm](https://pnpm.js.org/), [ESBuild](https://github.com/evanw/esbuild) - 快速
- 🔥 配置 & Markdown 文件热更新
- 🔧 `valaxy.config.ts` 的所有配置项皆有类型提示
- 🗒 扩展 Markdown Frontmatter
- 🗂 实现基于文件路由 by [vue-router](https://router.vuejs.org/file-based-routing/)
- 📦 自动引入组件 by [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
- 🖨 静态站点生成 (SSG) by [vite-ssg](https://github.com/antfu/vite-ssg) (支持单页面应用！)
- 🕸 RSS & Sitemap
- 🎨 尽情使用 Tailwind CSS by [UnoCSS](https://github.com/antfu/unocss)
- 🌍 [在同一页面通过 CSS 的 i18n](https://valaxy.site/guide/i18n)
- 🔍 [通过 class 从图标集中使用图标](https://github.com/antfu/unocss/tree/main/packages/preset-icons) - [Icônes](https://icones.netlify.app/)
- 👔 扩展主题 with [Layout system](https://github.com/loicduong/vite-plugin-vue-layouts-next)
- ⚙️ 单元测试 with [Vitest](https://github.com/vitest-dev/vitest)
- ☁️ 零配置部署
  - [Netlify](https://www.netlify.com/) with `netlify.toml`
  - [GitHub Pages](https://pages.github.com/) with `.github/workflows/gh-pages.yml` [GitHub Actions](https://github.com/features/actions)
- ♻️ 使用任意 Vite 插件
  - 📲 可以通过 [vite-plugin-pwa](https://github.com/antfu/vite-plugin-pwa) 使用 PWA
- ...

## 开发

想要参与开发？访问[这里](https://valaxy.site/dev)

想要创建你的主题？查看 [valaxy-theme-starter](https://github.com/YunYouJun/valaxy-theme-starter)

## 致谢

💗 Valaxy 的开发基于或参考以下项目：

- [Vue](https://github.com/vuejs/core)
- [VueUse](https://github.com/vueuse/vueuse)
- [Vite](https://github.com/vitejs/vite)
- [VitePress](https://github.com/vuejs/vitepress)
- [Vitesse](https://github.com/antfu/vitesse)
- [Slidev](https://github.com/slidevjs/slidev)

## [赞助者](https://www.yunyoujun.cn/sponsors/)

❤️ 特别感谢以下赞助者的支持。

<p align="center">
  <a href="https://www.yunyoujun.cn/sponsors/">
    <img src='https://fastly.jsdelivr.net/gh/YunYouJun/sponsors/public/sponsors.svg' alt="YunYouJun Sponsors"/>
  </a>
</p>

##  致谢

感谢所有为 Valaxy 贡献力量的朋友们

<a href="https://openomy.app/github/YunYouJun/valaxy" target="_blank" style="display: block; width: 100%;" align="center">
  <img src="https://openomy.app/svg?repo=YunYouJun/valaxy&chart=bubble&latestMonth=3" target="_blank" alt="Contribution Leaderboard" style="display: block; width: 100%;" />
 </a>
