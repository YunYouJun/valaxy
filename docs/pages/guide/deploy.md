---
title: Deployment
categories:
  - getting-started
top: 99
---


Deploying Valaxy is very easy. We suggest that you build and deploy to any platform using third party CI.


## Manual Deployment

::: code-group

```bash [pnpm]
pnpm run build
```

```bash [bun]
bunx valaxy build --ssg
```

```bash [yarn]
yarn build
```

```bash [npm]
npm run build
```

:::


Run the `build` command to build, and the `dist` directory contains the built content.

SSG build requires a sufficient heap (~4 GB; the engine auto-respawns with enough memory). If you still encounter `JavaScript heap out of memory`, set:

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

## Deploying under a base path

When the site is served below the domain root, configure Vite's `base` with both leading and trailing slashes. `siteConfig.url` is the canonical site URL; it does not replace the asset base. For example, a GitHub Pages project site at `https://user.github.io/repo/` uses:

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

Starting with Valaxy v1.0.0-rc.4, this behavior is aligned with VitePress and is enabled by default; there is no separate compatibility switch. The final `base` resolved by Vite is shared by the page, excerpt/router, and local-search Markdown renderers.

Root-absolute links and static assets written in Markdown are adjusted automatically:

```md
[Guide](/guide/)
![Logo](/logo.png)
[Download PDF](/manual.pdf)
```

For dynamic URLs in Vue components or theme configuration, use `withBase()`:

```vue
<script setup lang="ts">
import { withBase } from 'valaxy'

const logo = '/logo.png'
</script>

<template>
  <img :src="withBase(logo)" alt="Logo">
</template>
```

Markdown page and file links receive `base` directly. Markdown images are normalized for Vue/Vite's asset pipeline, which applies the final `base` to root-absolute public resources in the generated output.

External URLs and relative paths are left unchanged. Raw HTML `<a>` links are also left unchanged so you can deliberately link outside the configured base. Raw HTML images can still be transformed by Vue/Vite.


## Third Party Deployment

::: tip


The configuration files for the following third-party deployments are built into the Valaxy template project. You can use them as needed.

If the deployment fails, we recommend that you first check for potential build errors locally using `npm run build`.


:::

### GitHub Pages

<BrandIcon icon="i-logos:github-icon" link="https://pages.github.com/" />

::: tip


Repositories named `your-username.github.io` are served from `/` and do not need a custom `base`. Other repository names are supported as project sites; configure `base: '/repository-name/'` as described above.


:::

::: details .github/workflows/gh-pages.yml
<<< @/../packages/create-valaxy/template-blog/.github/workflows/gh-pages.yml
:::


When you use `pnpm create valaxy` to create a template project, it contains the file [`.github/workflows/gh-pages.yml`](https://github.com/YunYouJun/valaxy/blob/main/packages/create-valaxy/template-blog/.github/workflows/gh-pages.yml) for the CI workflow of GitHub Actions.

- Select the Github repository, go to `Settings`-> `Action` -> `General` -> `Workflow permissions`, and select `read and write permissions`.
- Push to your GitHub repository, and go to `Settings` -> `Pages`. Select `gh-pages` branch.

> `gh-pages` has been automatically deployed by `.github/workflows/gh-pages.yml`.

> Please note that the 'on.push.branches' in' gh-pages.yml' should be modified to the branch where your source code is located, and the default is 'main'.


### Netlify

<BrandIcon icon="i-logos:netlify-icon" link="https://www.netlify.com/" />


`netlify.toml` is built-in.

### Vercel

<BrandIcon icon="i-logos:vercel-icon" link="https://vercel.com/" />


- On Vercel Dashboard, click `Add New...`, then click `Project` to create a project.
- Select the repository you want to deploy and click `Import` and then set `Framework Preset` to `Other` and modify `Build and Output Settings`.
- Turn on the switch on the right of the textbox and type `dist`, click `Deploy`.
- Wait for ribbons to drop on the screen, then visit your website.

::: details netlify.toml
<<< @/../packages/create-valaxy/template-blog/netlify.toml
:::

### Cloudflare Pages

<BrandIcon icon="i-logos:cloudflare-icon" link="https://pages.cloudflare.com/" />


- Login to your Cloudflare account and navigate to "Workers and Pages" page.
- Click `Create a project` and `Connect to Git`, then select your GitHub or GitLab repository and click `Begin setup`.
- Select your Production branch.
- Set `Build output directory` to `pnpm build` .
- Set `Build output directory` to `dist` .
- Then click "Save and Deploy".

### Nginx

> [Nginx Docs](https://nginx.org/en/docs/)


Here is an example of an Nginx server block configuration `nginx.conf`. This configuration includes rules for gzip compression of common text-based resources, serving static files for a Valaxy site with appropriate caching headers, and handling `cleanUrls: true`.


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


This configuration assumes that the built Valaxy site is located in the `/usr/share/nginx/html` directory on the server. If your site files are located elsewhere, adjust the `root` directive accordingly.


### Docker

> [Docker Docs](https://docs.docker.com/)


Here is an example Dockerfile for building a Valaxy site and deploying it to an Nginx server.

Refer to the Nginx section for the `nginx.conf` configuration and place it in the same directory as the `Dockerfile`.


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


### Others

<BrandIcon class="text-xl!" icon="i-simple-icons-render" link="https://render.com/" />


You can also use [Render](https://render.com/) to host your website.

::: tip


Valaxy is also a static site like VitePress. You can refer to the [VitePress Deployment Guide](https://vitepress.dev/guide/deploy) for deployment.

:::
