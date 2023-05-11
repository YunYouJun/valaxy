---
title: FAQ
title_zh-CN: 常见问题
categories:
  - Guide
end: false
---

## 改变构建形式 {lang="zh-CN"}

## Change Generated Directory Style {lang="en"}

::: zh-CN
Valaxy 默认将 `xxx.md` 构建为 `/xxx.html`。

如果您更希望默认构建为 `/xxx/index.html` 的形式。

可以修改 `vite-ssg` 的配置。

在用户目录下的 `vite.config.ts` 中设置：
:::

::: en
Valaxy builds `xxx.md` as `/xxx.html` by default.

If you prefer to build them as `/xxx/index.html`, you can modify the configuration of `vite-ssg`.

Set it in `vite.config.ts` under the user directory as follows:
:::

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
  ssgOptions: {
    dirStyle: 'nested',
  }
})
```

## 部署到 Github Pages 后部分页面无法访问或 JS 路径找不到 {lang="zh-CN"}

## After deploying to Github Pages, some pages cannot be accessed or the JS path cannot be found {lang="en"}

::: zh-CN
Github Pages 默认使用 Jekyll 来构建静态站点，而 Jekyll 默认不会构建以 `_` 开头的文件或文件夹。

使用 Valaxy 构建后的产物可能会出现以 `_` 开头的文件，所以这种文件提交后会被 Jekyll 的构建忽略，从而导致问题发生。

实际上 Valaxy 构建后的产物可以直接用作静态站点，而不需要 Jekyll 构建这种多余的操作。

如果 Github Pages 所部署内容的根路径有名为 .nojekyll 的空文件，则会跳过 Jekyll 构建操作。

所以可以在 `.github/workflows/gh-pages.yml` 内的 `build` 脚本后添加一条这样的脚本：
:::

::: en
Github Pages uses Jekyll by default to build static sites, and Jekyll does not build files or folders that start with `_` by default.

The output of the Valaxy build may contain files that start with `_`, so these files will be ignored by Jekyll’s build after submission, causing problems.

In fact, the output of the Valaxy build can be used directly as a static site without the need for redundant Jekyll build operations.

If there is an empty file named .nojekyll in the root path of the content deployed by Github Pages, the Jekyll build operation will be skipped.

So you can add a script like this after the `build` script in `.github/workflows/gh-pages.yml`:
:::

```yml
- name: Ignore Jekyll build
  run: touch dist/.nojekyll
```
