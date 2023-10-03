---
title: Deployment
title_zh-CN: 部署
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

::: zh-CN
在使用 `pnpm create valaxy` 创建模版项目时，已内置文件[`.github/workflows/gh-pages.yml`](https://github.com/YunYouJun/valaxy/blob/main/packages/create-valaxy/template/.github/workflows/gh-pages.yml) 以实现 GitHub Actions 的自动部署工作流。


选择 Github Repo，打开 `Settings`-> `Action` -> `General` -> `Workflow permissions`，选择 `read and write permissions`。

上传至 GitHub Repo，打开 `Settings` -> `Pages`，选择 `gh-pages` 分支。

> `gh-pages` 已由 `.github/workflows/gh-pages.yml` 自动部署。


> 注意修改 `gh-pages.yml` 中的 `on.push.branches` 为你源代码所在的分支，默认为 `main`。

:::


::: en
When you use `pnpm create valaxy` to create a template project, it contains the file [`.github/workflows/gh-pages.yml`](https://github.com/YunYouJun/valaxy/blob/main/packages/create-valaxy/template/.github/workflows/gh-pages.yml) for the CI workflow of GitHub Actions.


Select the Github repository, go to `Settings`-> `Action` -> `General` -> `Workflow permissions`, and select `read and write permissions`。

Push to your GitHub repository, and go to `Settings` -> `Pages`. Select `gh-pages` branch.

> `gh-pages` has been automatically deployed by `.github/workflows/gh-pages.yml`.

> Please note that the 'on.push.branches' in' gh-pages.yml' should be modified to the branch where your source code is located, and the default is 'main'.

:::

#### Netlify

::: zh-CN
已内置 `netlify.toml`。

连接 GitHub 仓库，可以自动部署。
:::

::: en
`netlify.toml` is built-in.
:::

#### Vercel

::: zh-CN
在 Vercel 的 Dashboard 上，点击 `Add New...`，随后点击 `Project` 新建一个项目。

在左侧选择要部署的仓库，点击 `Import`，随后将 `Framework Preset` 设置为 `Other` 并更改 `Build and Output Settings`。

将 `Output Directory` 设置为 `dist` 后，点击 `Deploy`。

等待屏幕上撒下彩带后访问即可。
:::

::: en
On Vercel Dashboard, click `Add New...`, then click `Project` to create a project.

Select the repository you want to deploy and click `Import` and then set `Framework Preset` to `Other` and modify `Build and Output Settings`.

Turn on the switch on the right of the textbox and type `dist`, click `Deploy`.

Wait for ribbons to drop on the screen, then visit your website.
:::

#### Cloudflare Pages

::: zh-CN
登录你的 Cloudflare 账号，导航到 “Pages” 页面。

点击 `创建项目`、`连接到 Git`，选择你的 GitHub 或者 GitLab 仓库，并点击 `开始设置`。

选择你的部署分支，将 `构建输出目录` 设置为 `dist` 后添加一个环境变量。

> `NODE_VERSION`: `16` （设置 Node 版本）

点击 `保存并部署`。
:::

::: en
Login to your Cloudflare account and navigate to "Pages" page.

Click `Create a project` and `Connect to Git`, then select your GitHub or GitLab repository and click `Begin setup`.

Select your Production branch, set `Build output directory` to `dist` and add an environment variable.

> `NODE_VERSION`: `16` (Set Node version)

Then click "Save and Deploy".
:::

#### 其他 {lang="zh-CN"}

#### Others {lang="en"}

TODO

::: zh-CN
你还可以使用 [Render](https://render.com/) 等进行托管。
:::

::: en
You can also use [Render](https://render.com/) to host your website.
:::
