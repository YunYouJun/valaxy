---
title_zh: 从 Hexo 迁移至 Valaxy
title: Migrate from Hexo to Valaxy
categories:
  - migration
end: true
top: 9
---

## 迁移步骤 {lang="zh-CN"}

## Migration Steps {lang="en"}

### 迁移内容 {lang="zh-CN"}

### Migrate Contents {lang="zh-CN"}

::: zh-CN
Hexo 博客目录与 Valaxy 博客目录对应关系如下，将相关内容复制至对应文件夹即可。

> 譬如**迁移文章**，即将 Hexo `source/_posts` 目录下内容复制至 Valaxy `pages/posts` 目录下。

|用途|Hexo|Valaxy|
|---|---|---|
|文章（Markdown 文件）|`source/_posts`|`pages/posts`|
|页面（Markdown / Html）|`source`|`pages`|
|静态资源（`*.js` / `*.css` / `CNAME` etc.）|`source`|`public`|
:::

::: en
The relationship between Hexo blog directory and Valaxy blog directory is shown in the table below. Just copy the relevant contents to the corresponding folder.

> For example: **To migrate articles**, just copy files from Hexo's `source/_posts` to Valaxy's `pages/posts` directory.

|Contents|Hexo|Valaxy|
|---|---|---|
|Posts (Markdown files)|`source/_posts`|`pages/posts`|
|Pages (Markdown / Html files)|`source`|`pages`|
|Static assets (`*.js` / `*.css` / `CNAME` etc.)|`source`|`public`|
:::

### 迁移配置 {lang="zh-CN"}

### Migrate Configurations {lang="en"}

::: zh-CN
参考 [Valaxy 配置文档](/guide/config/) 将 Hexo `_config.yml` 配置文件中的内容，迁移至 `valaxy.config.ts` 文件中。

> 配置示例：[demo/yun/valaxy.config.ts](https://github.com/YunYouJun/valaxy/blob/main/demo/yun/valaxy.config.ts)、[yunyoujun.github.io/valaxy.config.ts](https://github.com/YunYouJun/yunyoujun.github.io/blob/valaxy/valaxy.config.ts)
> `valaxy.config.ts` 提供了完备的类型提示，这意味着你在 VSCode 中可以直接鼠标悬浮查看各参数注释。
:::

::: en
Refer to [Valaxy Config](/guide/config/) to migrate configurations from Hexo's `_config.yml` to Valaxy's `valaxy.config.ts`.

> Examples of configuration: [demo/yun/valaxy.config.ts](https://github.com/YunYouJun/valaxy/blob/main/demo/yun/valaxy.config.ts), [yunyoujun.github.io/valaxy.config.ts](https://github.com/YunYouJun/yunyoujun.github.io/blob/valaxy/valaxy.config.ts).
> `valaxy.config.ts` provides a complete type prompt, which means that you can hover on configuration fields directly to view the comments in VSCode.
:::

## 示例 {lang="zh-CN"}

## Example {lang="en"}

::: zh-CN
更复杂的迁移示例，您还可以对比 [yunyoujun.github.io | GitHub](https://github.com/YunYouJun/yunyoujun.github.io) 仓库 [hexo](https://github.com/YunYouJun/yunyoujun.github.io/tree/hexo) 分支与 [valaxy](https://github.com/YunYouJun/yunyoujun.github.io/tree/valaxy) 的异同。
:::

::: en
For more complex migration examples, you can also compare [hexo branch](https://github.com/YunYouJun/yunyoujun.github.io/tree/hexo) and [valaxy branch](https://github.com/YunYouJun/yunyoujun.github.io/tree/valaxy) in [yunyoujun.github.io | GitHub](https://github.com/YunYouJun/yunyoujun.github.io) to see the similarities and differences.
:::
