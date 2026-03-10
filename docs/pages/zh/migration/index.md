---
title: 从其他博客框架迁移
categories:
  - migration
top: 10
---

## AI 迁移助手 {#ai-migration-assistant}


选择你的原始框架，复制提示词到 AI 助手中，快速完成迁移。


<MigrationPrompt />

## 从 Hexo 迁移至 Valaxy {#migrate-from-hexo-to-valaxy}


### 迁移内容 {#migrate-contents}


Hexo 博客目录与 Valaxy 博客目录对应关系如下，将相关内容复制至对应文件夹即可。

> 譬如**迁移文章**，即将 Hexo `source/_posts` 目录下内容复制至 Valaxy `pages/posts` 目录下。

|用途|Hexo|Valaxy|
|---|---|---|
|文章（Markdown 文件）|`source/_posts`|`pages/posts`|
|页面（Markdown / Html）|`source`|`pages`|
|静态资源（`*.js` / `*.css` / `CNAME` etc.）|`source`|`public`|



### 迁移配置 {#migrate-configurations}


参考 [Valaxy 配置文档](/zh/guide/config/) 将 Hexo `_config.yml` 配置文件中的内容，迁移至 `valaxy.config.ts` 文件中。

> 配置示例：[demo/yun/valaxy.config.ts](https://github.com/YunYouJun/valaxy/blob/main/demo/yun/valaxy.config.ts)、[yunyoujun.github.io/valaxy.config.ts](https://github.com/YunYouJun/yunyoujun.github.io/blob/valaxy/valaxy.config.ts)
> `valaxy.config.ts` 提供了完备的类型提示，这意味着你在 VSCode 中可以直接鼠标悬浮查看各参数注释。


### 示例 {#example}


更复杂的迁移示例，您还可以对比 [yunyoujun.github.io | GitHub](https://github.com/YunYouJun/yunyoujun.github.io) 仓库 [hexo](https://github.com/YunYouJun/yunyoujun.github.io/tree/hexo) 分支与 [valaxy](https://github.com/YunYouJun/yunyoujun.github.io/tree/valaxy) 的异同。


## 从其他任意博客框架迁移 {#migrate-from-any-other-blog-framework}



- 将你的文章（Markdown 文件）复制至 Valaxy `pages/posts` 目录下。
- 将你的自定义页面（非文章的 Markdown/HTML 文件）复制至 Valaxy `pages` 目录下。
- 将你的静态资源（图片等）复制至 Valaxy `public` 目录下。
- 参考 [配置](/zh/guide/config/) 配置你的配置文件 `valaxy.config.ts`/`site.config.ts`。


## 常见问题 {#common-problems}


### 摘要截断符 {#read-more-separator}


默认为 `<!-- more -->`，`more` 前后需有空格。


### Markdown 换行 {#newline-in-markdown}


Valaxy 的 Markdown 解析基于 [`markdown-it`](https://github.com/markdown-it/markdown-it) 实现。

#### 没有换行

`markdown-it` 的策略在 Markdown 中换行后渲染的内容并没有换行：

```md
第一行
没有换行
```

第一行
没有换行

---

#### 换行了

如果需要正常换行，需在末尾添加两个空格：

```md
第一行（末尾有两个空格）  
换行了
```

第一行（末尾有两个空格）  
换行了


