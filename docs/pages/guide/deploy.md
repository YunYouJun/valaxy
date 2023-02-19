---
title: Deployment
title_zh-CN: 部署
categories:
  - Getting Started
end: false
top: 99
---

::: zh-CN
Valaxy 的部署非常简单，我们推荐你直接通过第三方的 CI 构建并托管到任意平台。
:::

::: en
Deploying Valaxy is very easy. We suggest that you build and deploy to any platform using third party CI.
:::

### 自行部署 {lang="zh-CN"}

### Manual Deployment {lang="en"}

::: zh-CN

```bash
# 构建打包
npm run build
# dist 文件夹为构建后的内容
```

:::

::: en

```bash
# Build the package
npm run build
# The `dist/` directory contains the artifact
```

:::

### 第三方部署 {lang="zh-CN"}

### Third Party Deployment {lang="en"}

#### GitHub Pages

::: zh-CN
在使用 `pnpm create valaxy` 创建模版项目时，已内置文件[`.github/workflows/gh-pages.yml`](https://github.com/YunYouJun/valaxy/blob/main/packages/create-valaxy/template/.github/workflows/gh-pages.yml) 以实现 GitHub Actions 的自动部署工作流。

上传至 GitHub Repo，打开 `Settings` -> `Pages`，选择 `gh-pages` 分支。

选择 Github Repo，打开 `Settings`-> `Action` -> `General` -> `Workflow permissions`，选择 `read and write permissions`。

> `gh-pages` 已由 `.github/workflows/gh-pages.yml` 自动部署。
:::

::: en
When you use `pnpm create valaxy` to create a template project, it contains the file [`.github/workflows/gh-pages.yml`](https://github.com/YunYouJun/valaxy/blob/main/packages/create-valaxy/template/.github/workflows/gh-pages.yml) for the CI workflow of GitHub Actions.

Push to your GitHub repository, and go to `Settings` -> `Pages`. Select `gh-pages` branch.

Select the Github repository, go to `Settings`-> `Action` -> `General` -> `Workflow permissions`, and select `read and write permissions`。

> `gh-pages` has been automatically deployed by `.github/workflows/gh-pages.yml`.
:::

#### Netlify

::: zh-CN
已内置 `netlify.toml`.
:::

::: en
`netlify.toml` is built-in.
:::

#### 其他 {lang="zh-CN"}

#### Others {lang="en"}

TODO

::: zh-CN
你还可以使用 [Vercel](https://vercel.com/)/[Render](https://render.com/)/[Cloudflare Pages](https://pages.cloudflare.com/) 等进行托管。
:::

::: en
You can also use [Vercel](https://vercel.com/)/[Render](https://render.com/)/[Cloudflare Pages](https://pages.cloudflare.com/) to host your website.
:::
