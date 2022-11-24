---
title: Deploy
title_zh: 部署
categories:
  - Guide
end: false
---

Valaxy 的部署非常简单，我们推荐你直接通过第三方的 CI 构建并托管到任意平台。

### 自行部署

```bash
# 构建打包
npm run build
# dist 文件夹为构建后的内容
```

### 第三方部署

#### GitHub Pages

在使用 `pnpm create valaxy` 创建模版项目时，已内置文件[`.github/workflows/gh-pages.yml`](https://github.com/YunYouJun/valaxy/blob/main/packages/create-valaxy/template/.github/workflows/gh-pages.yml) 以实现 GitHub Actions 的自动部署工作流。

上传至 GitHub Repo，打开 `Settings` -> `Pages`，选择 `gh-pages` 分支。

> `gh-pages` 已由 `.github/workflows/gh-pages.yml` 自动部署。

#### Netlify

已内置 `netlify.toml`.

#### 其他

TODO

你还可以使用 [Vercel](https://vercel.com/)/[Render](https://render.com/)/[Cloudflare Pages](https://pages.cloudflare.com/) 等进行托管。
