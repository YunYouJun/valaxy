---
title: Deployment
title_zh: 部署
categories:
  - getting-started
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

<BrandIcon icon="i-logos:github-icon" link="https://pages.github.com/" />

::: zh-CN
在使用 `pnpm create valaxy` 创建模版项目时，已内置文件[`.github/workflows/gh-pages.yml`](https://github.com/YunYouJun/valaxy/blob/main/packages/create-valaxy/template-blog/.github/workflows/gh-pages.yml) 以实现 GitHub Actions 的自动部署工作流。

- 选择 Github Repo，打开 `Settings`-> `Action` -> `General` -> `Workflow permissions`，选择 `read and write permissions`。
- 上传至 GitHub Repo，打开 `Settings` -> `Pages`，选择 `gh-pages` 分支。

> `gh-pages` 已由 `.github/workflows/gh-pages.yml` 自动部署。

> 注意修改 `gh-pages.yml` 中的 `on.push.branches` 为你源代码所在的分支，默认为 `main`。

:::

::: en
When you use `pnpm create valaxy` to create a template project, it contains the file [`.github/workflows/gh-pages.yml`](https://github.com/YunYouJun/valaxy/blob/main/packages/create-valaxy/template-blog/.github/workflows/gh-pages.yml) for the CI workflow of GitHub Actions.

- Select the Github repository, go to `Settings`-> `Action` -> `General` -> `Workflow permissions`, and select `read and write permissions`。
- Push to your GitHub repository, and go to `Settings` -> `Pages`. Select `gh-pages` branch.

> `gh-pages` has been automatically deployed by `.github/workflows/gh-pages.yml`.

> Please note that the 'on.push.branches' in' gh-pages.yml' should be modified to the branch where your source code is located, and the default is 'main'.

:::

#### Netlify

<BrandIcon icon="i-logos:netlify-icon" link="https://www.netlify.com/" />

::: zh-CN
已内置 `netlify.toml`。

- 连接 GitHub 仓库，可自动部署。
:::

::: en
`netlify.toml` is built-in.
:::

#### Vercel

<BrandIcon icon="i-logos:vercel-icon" link="https://vercel.com/" />

::: zh-CN

对于已有的 Valaxy 博客，在开始部署之前，您需要先对您博客的 `vercel.json` 进行修改以便[启用 `cleanUrls` 支持](https://vercel.com/docs/projects/project-configuration#cleanurls)：

```json
{
  "cleanUrls": true
}
```

对于新创建的 Valaxy 博客，您只需要直接进行接下来的步骤即可。

- 在 Vercel 的 Dashboard 上，点击 `Add New...`，随后点击 `Project` 新建一个项目。
- 在左侧选择要部署的仓库，点击 `Import`，随后将 `Framework Preset` 设置为 `Other` 并更改 `Build and Output Settings`。
- 将 `Output Directory` 设置为 `dist` 后，点击 `Deploy`。
- 等待屏幕上撒下彩带后访问即可。
:::

::: en

- On Vercel Dashboard, click `Add New...`, then click `Project` to create a project.
- Select the repository you want to deploy and click `Import` and then set `Framework Preset` to `Other` and modify `Build and Output Settings`.
- Turn on the switch on the right of the textbox and type `dist`, click `Deploy`.
- Wait for ribbons to drop on the screen, then visit your website.
:::

#### Cloudflare Pages

<BrandIcon icon="i-logos:cloudflare-icon" link="https://pages.cloudflare.com/" />

::: zh-CN

- 登录你的 Cloudflare 账号，导航到 “Pages” 页面。
- 点击 `创建项目`、`连接到 Git`，选择你的 GitHub 或者 GitLab 仓库，并点击 `开始设置`。
- 选择你的部署分支。
- 将 `构建命令` 设置为 `npm run build` 。
- 将 `构建输出目录` 设置为 `dist` 后添加一个环境变量。

> `NODE_VERSION`: `16` （设置 Node 版本）

- 点击 `保存并部署`。
:::

::: en

- Login to your Cloudflare account and navigate to "Pages" page.
- Click `Create a project` and `Connect to Git`, then select your GitHub or GitLab repository and click `Begin setup`.
- Select your Production branch.
- Set `Build output directory` to `npm run build` .
- Set `Build output directory` to `dist` and add an environment variable.

> `NODE_VERSION`: `16` (Set Node version)

- Then click "Save and Deploy".
:::

#### Nginx

> [Nginx Docs](https://nginx.org/en/docs/)

::: zh-CN

下面是一个 Nginx 服务器块配置示例。此配置包括对基于文本的常见资源的 gzip 压缩、使用适当缓存头为 Valaxy 站点静态文件提供服务的规则以及处理 `cleanUrls: true` 的方法。

:::

::: en

Here is an example of an Nginx server block configuration. This configuration includes rules for gzip compression of common text-based resources, serving static files for a Valaxy site with appropriate caching headers, and handling `cleanUrls: true`.

:::

```nginx
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen 80;
    server_name _;
    index index.html;

    location / {
        # content location
        root /app;

        # exact matches -> reverse clean urls -> folders -> not found
        try_files $uri $uri.html $uri/ =404;

        # non existent pages
        error_page 404 /404.html;

        # a folder without index.html raises 403 in this setup
        error_page 403 /404.html;

        # adjust caching headers
        # files in the assets folder have hashes filenames
        location ~* ^/assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

::: zh-CN

本配置默认已构建的 Valaxy 站点位于服务器上的 `/app` 目录中。如果站点文件位于其他位置，请相应调整 `root` 指令。

:::

::: en

This configuration assumes that the built Valaxy site is located in the `/app` directory on the server. If your site files are located elsewhere, adjust the `root` directive accordingly.

:::

#### 其他 {lang="zh-CN"}

#### Others {lang="en"}

<BrandIcon class="text-xl!" icon="i-simple-icons-render" link="https://render.com/" />

::: zh-CN
你还可以使用 [Render](https://render.com/) 等进行托管。

:::

::: en
You can also use [Render](https://render.com/) to host your website.
:::

::: tip

<div lang="zh-CN">

Valaxy 与 VitePress 同样是静态站点。你也可以参考 [VitePress 部署指南](https://vitepress.dev/zh/guide/deploy) 进行部署。
</div>

<div lang="en">

Valaxy is also a static site like VitePress. You can refer to the [VitePress Deployment Guide](https://vitepress.dev/guide/deploy) for deployment.
</div>

:::
