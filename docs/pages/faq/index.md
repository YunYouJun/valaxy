---
title: FAQ
title_zh: 常见问题
categories:
  - guide
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

所以可以在项目的 `public` 文件夹内新建一个名为 `.nojekyll` 的文件：
:::

::: en
Github Pages uses Jekyll by default to build static sites, and Jekyll does not build files or folders that start with `_` by default.

The output of the Valaxy build may contain files that start with `_`, so these files will be ignored by Jekyll’s build after submission, causing problems.

In fact, the output of the Valaxy build can be used directly as a static site without the need for redundant Jekyll build operations.

If there is an empty file named .nojekyll in the root path of the content deployed by Github Pages, the Jekyll build operation will be skipped.

So you can create a new file named `.nojekyll` in the `public` folder of the project:
:::

```bash
|-- public
|   |-- .nojekyll
```

## 显示的文章创建/修改时间不是 UTC 时间 {lang="zh-CN"}

## The displayed article creation/modification time is not UTC time {lang="en"}

::: zh-CN
根据[这份 `YAML` 规范](https://yaml.org/type/timestamp.html)，符合 `ISO 8601` 标准的时间格式都会被解析为 `Date` 类型，且**不显式标注时区的时间戳都会作 UTC 处理**。

但是为了方便写作与从其他框架迁移，我们将未显式标注时区的时间戳解析为 `site.config.ts` 中 `timezone` 对应的时间（即 `2024-07-06 12:00:00` 在 `Asia/Shanghai` 下会解析 为 `2024-07-06T12:00:00+08:00`）。

无论如何，我们建议**显式**添加时区信息，例如：

```yaml
date: 2024-07-06 12:00:00 +8
```

这样就能正确解析为 UTC+8 时区的 `2024-07-06 12:00:00`。

主题作者也能通过在 `scaffolds/post.md` 中使用 `date: <%=date%> +8` 来实现这一点。
:::

::: en
According to [this `YAML` specification](https://yaml.org/type/timestamp.html), time formats that conform to the `ISO 8601` standard will be parsed as `Date` type, and **timestamps without explicitly marked time zones will be treated as UTC**.

However, for the convenience of writing and migrating from other frameworks, we parse timestamps without explicitly marked time zones as the time corresponding to `timezone` in `site.config.ts` (i.e., `2024-07-06 12:00:00` will be parsed as `2024-07-06T12:00:00+08:00` in `Asia/Shanghai`).

Nevertheless, we recommend **explicitly** adding time zone information, for example:

```yaml
date: 2024-07-06 12:00:00 +8
```

This way, it can be correctly parsed as `2024-07-06 12:00:00` in the UTC+8 time zone.

Theme authors can also achieve this by using `date: <%=date%> +8` in `scaffolds/post.md`.
:::
