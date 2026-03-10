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

```bash [yarn]
yarn build
```

```bash [npm]
npm run build
```

:::


Run the `build` command to build, and the `dist` directory contains the built content.

SSG build (default Valaxy SSG engine) requires at least ~2 GB of heap memory; the legacy vite-ssg engine requires ~2.3 GB. If you encounter `JavaScript heap out of memory`, set:

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```


## Third Party Deployment

::: tip


The configuration files for the following third-party deployments are built into the Valaxy template project. You can use them as needed.

If the deployment fails, we recommend that you first check for potential build errors locally using `npm run build`.


:::

### GitHub Pages

<BrandIcon icon="i-logos:github-icon" link="https://pages.github.com/" />

::: tip


When you use GitHub Pages for hosting, make sure your repository name is `your-username.github.io`.

This is because when there is a directory with the same name, GitHub Pages will default to assigning `your-username.github.io` as your personal domain.

> Although you can rename it to other names and set custom domains, etc. (For more advanced operations, you can search by yourself.)  
> But as a beginner, I recommend you follow the default rules to avoid unexpected errors.


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


### Others

<BrandIcon class="text-xl!" icon="i-simple-icons-render" link="https://render.com/" />


You can also use [Render](https://render.com/) to host your website.

::: tip


Valaxy is also a static site like VitePress. You can refer to the [VitePress Deployment Guide](https://vitepress.dev/guide/deploy) for deployment.

:::
