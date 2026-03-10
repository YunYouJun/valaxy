---
title: Migration from Other
categories:
  - migration
top: 10
---


## AI Migration Assistant


Select your source framework, copy the prompt to your AI assistant, and migrate quickly.

<MigrationPrompt />


## Migrate from Hexo to Valaxy


### Migrate Contents


The relationship between Hexo blog directory and Valaxy blog directory is shown in the table below. Just copy the relevant contents to the corresponding folder.

> For example: **To migrate articles**, just copy files from Hexo's `source/_posts` to Valaxy's `pages/posts` directory.

|Contents|Hexo|Valaxy|
|---|---|---|
|Posts (Markdown files)|`source/_posts`|`pages/posts`|
|Pages (Markdown / Html files)|`source`|`pages`|
|Static assets (`*.js` / `*.css` / `CNAME` etc.)|`source`|`public`|


### Migrate Configurations


Refer to [Valaxy Config](/guide/config/) to migrate configurations from Hexo's `_config.yml` to Valaxy's `valaxy.config.ts`.

> Examples of configuration: [demo/yun/valaxy.config.ts](https://github.com/YunYouJun/valaxy/blob/main/demo/yun/valaxy.config.ts), [yunyoujun.github.io/valaxy.config.ts](https://github.com/YunYouJun/yunyoujun.github.io/blob/valaxy/valaxy.config.ts).
> `valaxy.config.ts` provides a complete type prompt, which means that you can hover on configuration fields directly to view the comments in VSCode.


### Example


For more complex migration examples, you can also compare [hexo branch](https://github.com/YunYouJun/yunyoujun.github.io/tree/hexo) and [valaxy branch](https://github.com/YunYouJun/yunyoujun.github.io/tree/valaxy) in [yunyoujun.github.io | GitHub](https://github.com/YunYouJun/yunyoujun.github.io) to see the similarities and differences.


## Migrate from any other blog framework


- Copy your posts (Markdown files) to the Valaxy `pages/posts` directory.
- Copy your custom pages (non-article Markdown/HTML files) to the Valaxy `pages` directory.
- Copy your static resources (images, etc.) to the Valaxy `public` directory.
- Configure your configuration file `valaxy.config.ts`/`site.config.ts` by referring to [configuration](/guide/config/).


## Common Problems


### Read More Separator


Default to `<-- More -->`, there are spaces before and after `more`.


### Newline in Markdown


Markdown rendering in Valaxy is based on [`markdown-it`](https://github.com/markdown-it/markdown-it).

The default strategy of `markdown-it` does not wrap the rendered content when wrapping in Markdown:

```md
first line
second line but not wrapped
```

first line
second line but not wrapped

---

If you want to move the second line to a new line, add two spaces at the end of the first line:

```md
first line (with two spaces at the end)  
second line got wrapped corrently
```

first line (with two spaces at the end)  
second line got wrapped corrently
