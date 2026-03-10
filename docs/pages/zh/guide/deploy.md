---
title: 部署
categories:
  - getting-started
top: 99
---

Valaxy 的部署非常简单，我们推荐你直接通过第三方的 CI 构建并托管到任意平台。


## 自行部署


::: code-group

```bash [pnpm]
pnpm run build
```

```bash [yarn]
yarn build
```

```bash [npm]
npm run build
```

:::


执行 `build` 命令构建，`dist` 文件夹为构建后的内容。

SSG 构建（默认 Valaxy SSG 引擎）最低需要 ~2 GB 堆内存；传统 vite-ssg 引擎需要 ~2.3 GB。如果遇到 `JavaScript heap out of memory` 错误，请设置：

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```



## 第三方部署


::: tip


第三方部署的各配置文件已内置在 Valaxy 的初始化模版项目中，您可以按需使用。

如果部署失败，推荐您先在本地通过 `npm run build` 检查潜在的构建错误。



:::

### GitHub Pages

<BrandIcon icon="i-logos:github-icon" link="https://pages.github.com/" />

::: tip


当您使用 GitHub Pages 托管时，请确保您的仓库名为 `你的用户名.github.io`。

这是因为当存在同名目录时，GitHub Pages 会默认为您分配 `你的用户名.github.io` 作为你的个人域名。

> 尽管您也可以将其重命名为其他名称，并设置自定义域名等。（更多的进阶操作，可自行搜索。）  
> 但作为新手，我更推荐您遵循默认规则，以避免意想不到的错误。



:::

::: details .github/workflows/gh-pages.yml
<<< @/../packages/create-valaxy/template-blog/.github/workflows/gh-pages.yml
:::

在使用 `pnpm create valaxy` 创建模版项目时，已内置文件[`.github/workflows/gh-pages.yml`](https://github.com/YunYouJun/valaxy/blob/main/packages/create-valaxy/template-blog/.github/workflows/gh-pages.yml) 以实现 GitHub Actions 的自动部署工作流。

- 选择 Github Repo，打开 `Settings`-> `Action` -> `General` -> `Workflow permissions`，选择 `read and write permissions`。
- 上传至 GitHub Repo，打开 `Settings` -> `Pages`，选择 `gh-pages` 分支。

> `gh-pages` 已由 `.github/workflows/gh-pages.yml` 自动部署。

> 注意修改 `gh-pages.yml` 中的 `on.push.branches` 为你源代码所在的分支，默认为 `main`。



### Netlify

<BrandIcon icon="i-logos:netlify-icon" link="https://www.netlify.com/" />

已内置 `netlify.toml`。

- 连接 GitHub 仓库，可自动部署。


### Vercel

<BrandIcon icon="i-logos:vercel-icon" link="https://vercel.com/" />


对于已有的 Valaxy 博客，在开始部署之前，您需要先对您博客的 `vercel.json` 进行修改以便[启用 `cleanUrls` 支持](https://vercel.com/docs/projects/project-configuration#cleanurls)：

```json [vercel.json]
{
  "cleanUrls": true
}
```

对于新创建的 Valaxy 博客，您只需要直接进行接下来的步骤即可。

- 在 Vercel 的 Dashboard 上，点击 `Add New...`，随后点击 `Project` 新建一个项目。
- 在左侧选择要部署的仓库，点击 `Import`，随后将 `Framework Preset` 设置为 `Other` 并更改 `Build and Output Settings`。
- 将 `Output Directory` 设置为 `dist` 后，点击 `Deploy`。
- 等待屏幕上撒下彩带后访问即可。


::: details netlify.toml
<<< @/../packages/create-valaxy/template-blog/netlify.toml
:::

### Cloudflare Pages

<BrandIcon icon="i-logos:cloudflare-icon" link="https://pages.cloudflare.com/" />


- 登录你的 [Cloudflare](https://www.cloudflare-cn.com/) 账号，从侧边栏导航至 “Workers 和 Pages” 页面。
- 点击 `创建项目`、`连接到 Git`，选择你的 GitHub 或者 GitLab 仓库，并点击 `开始设置`。
- 选择你的部署分支。
- 将 `构建命令` 设置为 `pnpm build` 。
- 将 `构建输出目录` 设置为 `dist` 。
- 点击 `保存并部署`。


### Nginx

> [Nginx Docs](https://nginx.org/en/docs/)


下面是一个 Nginx 服务器块配置示例 `nginx.conf`。此配置包括对基于文本的常见资源的 gzip 压缩、使用适当缓存头为 Valaxy 站点静态文件提供服务的规则以及处理 `cleanUrls: true` 的方法。



::: details nginx.conf

```nginx [nginx.conf]
server {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen 80;
    server_name _;
    index index.html;

    location / {
        # content location
        # root /app;
        root /usr/share/nginx/html;

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

:::


本配置默认已构建的 Valaxy 站点位于服务器上的 `/usr/share/nginx/html` 目录中。如果站点文件位于其他位置，请相应调整 `root` 指令。



### Docker

> [Docker Docs](https://docs.docker.com/)


下面是一个 Dockerfile 示例，用于构建 Valaxy 站点并将其部署到 Nginx 服务器中。

请参考 Nginx 部分配置 `nginx.conf`，并将其放置于 `Dockerfile` 同一目录下。



::: details Dockerfile

```Dockerfile [Dockerfile]
FROM node:20-alpine as build-stage

WORKDIR /app
RUN corepack enable

COPY .npmrc package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:stable-alpine as production-stage

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

:::

### 其他


<BrandIcon class="text-xl!" icon="i-simple-icons-render" link="https://render.com/" />

你还可以使用 [Render](https://render.com/) 等进行托管。



::: tip


Valaxy 与 VitePress 同样是静态站点。你也可以参考 [VitePress 部署指南](https://vitepress.dev/zh/guide/deploy) 进行部署。


:::

