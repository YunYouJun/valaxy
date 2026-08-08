---
title: 部署
categories:
  - getting-started
top: 99
---

Valaxy 的部署非常简单，我们推荐你直接通过第三方的 CI 构建并托管到任意平台。


## 自行部署 {#manual-deployment}


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

SSG 构建需要足够的堆内存（~4 GB；引擎会自动以足够内存重启）。若仍遇到 `JavaScript heap out of memory` 错误，请设置：

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

## 部署到子路径 {#deploy-under-base-path}

当站点部署在域名的子路径下时，请配置 Vite 的 `base`，并保留开头和结尾的 `/`。`siteConfig.url` 表示站点的规范 URL，不能代替资源路径的 `base`。例如，GitHub Pages 项目站点 `https://user.github.io/repo/` 应配置为：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  siteConfig: {
    url: 'https://user.github.io/repo/',
  },
  vite: {
    base: '/repo/',
  },
})
```

从 Valaxy v1.0.0-rc.4 开始，这部分行为默认与 VitePress 对齐，不需要额外开启兼容开关。Vite 最终解析出的 `base` 会共享给页面、摘要/路由和本地搜索使用的 Markdown 渲染器。

Markdown 中的根绝对链接和静态资源会自动适配 `base`：

```md
[指南](/guide/)
![Logo](/logo.png)
[下载 PDF](/manual.pdf)
```

Vue 组件或主题配置中的动态 URL 请使用 `withBase()`：

```vue
<script setup lang="ts">
import { withBase } from 'valaxy'

const logo = '/logo.png'
</script>

<template>
  <img :src="withBase(logo)" alt="Logo">
</template>
```

Markdown 页面与文件链接会直接补上 `base`；Markdown 图片则会进入 Vue/Vite 静态资源处理链路，由它在最终产物中为根绝对 public 资源应用 `base`。

外部 URL 和相对路径不会被修改。原生 HTML `<a>` 链接也保持原样，以便显式链接到 `base` 之外的位置；原生 HTML 图片仍可能由 Vue/Vite 转换。



## 第三方部署 {#third-party-deployment}


::: tip


第三方部署的各配置文件已内置在 Valaxy 的初始化模版项目中，您可以按需使用。

如果部署失败，推荐您先在本地通过 `npm run build` 检查潜在的构建错误。



:::

### GitHub Pages {#github-pages}

<BrandIcon icon="i-logos:github-icon" link="https://pages.github.com/" />

::: tip


名为 `你的用户名.github.io` 的仓库会部署在根路径 `/`，无需额外设置 `base`。其他仓库名也可以作为项目站点部署，请按照上文配置 `base: '/仓库名/'`。



:::

::: details .github/workflows/gh-pages.yml
<<< @/../packages/create-valaxy/template-blog/.github/workflows/gh-pages.yml
:::

在使用 `pnpm create valaxy` 创建模版项目时，已内置文件[`.github/workflows/gh-pages.yml`](https://github.com/YunYouJun/valaxy/blob/main/packages/create-valaxy/template-blog/.github/workflows/gh-pages.yml) 以实现 GitHub Actions 的自动部署工作流。

- 选择 Github Repo，打开 `Settings`-> `Action` -> `General` -> `Workflow permissions`，选择 `read and write permissions`。
- 上传至 GitHub Repo，打开 `Settings` -> `Pages`，选择 `gh-pages` 分支。

> `gh-pages` 已由 `.github/workflows/gh-pages.yml` 自动部署。

> 注意修改 `gh-pages.yml` 中的 `on.push.branches` 为你源代码所在的分支，默认为 `main`。



### Netlify {#netlify}

<BrandIcon icon="i-logos:netlify-icon" link="https://www.netlify.com/" />

已内置 `netlify.toml`。

- 连接 GitHub 仓库，可自动部署。


### Vercel {#vercel}

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

### Cloudflare Pages {#cloudflare-pages}

<BrandIcon icon="i-logos:cloudflare-icon" link="https://pages.cloudflare.com/" />


- 登录你的 [Cloudflare](https://www.cloudflare-cn.com/) 账号，从侧边栏导航至 “Workers 和 Pages” 页面。
- 点击 `创建项目`、`连接到 Git`，选择你的 GitHub 或者 GitLab 仓库，并点击 `开始设置`。
- 选择你的部署分支。
- 将 `构建命令` 设置为 `pnpm build` 。
- 将 `构建输出目录` 设置为 `dist` 。
- 点击 `保存并部署`。


### Nginx {#nginx}

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



### Docker {#docker}

> [Docker Docs](https://docs.docker.com/)


下面是一个 Dockerfile 示例，用于构建 Valaxy 站点并将其部署到 Nginx 服务器中。

请参考 Nginx 部分配置 `nginx.conf`，并将其放置于 `Dockerfile` 同一目录下。



::: details Dockerfile

```Dockerfile [Dockerfile]
FROM node:22.12-alpine as build-stage

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

### 其他 {#others}


<BrandIcon class="text-xl!" icon="i-simple-icons-render" link="https://render.com/" />

你还可以使用 [Render](https://render.com/) 等进行托管。



::: tip


Valaxy 与 VitePress 同样是静态站点。你也可以参考 [VitePress 部署指南](https://vitepress.dev/zh/guide/deploy) 进行部署。


:::
