---
title: 常见问题
categories:
  - guide
end: false
---

## 构建失败 {#构建失败}

### ReferenceError: document is not defined {#referenceerror-document-is-not-defined}

这通常发生在使用自定义代码 `document.xxx` 或引入第三方库（仅在浏览器端可用的 NPM 包）时。
代码直接调用了 `document`，而该变量在 Node 端不存在，因此导致构建失败。

你应当使用 `isClient` 判断逻辑来使得该代码仅在客户端执行。

```ts
import { isClient } from '@vueuse/core'

if (isClient) {
  document.xxx()
  // import('xxx')
}
```

## 改变构建形式 {#change-generated-directory-style}


Valaxy 默认将 `xxx.md` 构建为 `/xxx.html`。

如果您更希望默认构建为 `/xxx/index.html` 的形式。

可以修改 `vite-ssg` 的配置。

在用户目录下的 `vite.config.ts` 中设置：


```ts [vite.config.ts]
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
  ssgOptions: {
    dirStyle: 'nested',
  }
})
```

## 部署到 Github Pages 后部分页面无法访问或 JS 路径找不到 {#after-deploying-to-github-pages-some-pages-cannot-be-accessed-or-the-js-path-cannot-be-found}


Github Pages 默认使用 Jekyll 来构建静态站点，而 Jekyll 默认不会构建以 `_` 开头的文件或文件夹。

使用 Valaxy 构建后的产物可能会出现以 `_` 开头的文件，所以这种文件提交后会被 Jekyll 的构建忽略，从而导致问题发生。

实际上 Valaxy 构建后的产物可以直接用作静态站点，而不需要 Jekyll 构建这种多余的操作。

如果 Github Pages 所部署内容的根路径有名为 .nojekyll 的空文件，则会跳过 Jekyll 构建操作。

所以可以在项目的 `public` 文件夹内新建一个名为 `.nojekyll` 的文件：


```bash
|-- public
|   |-- .nojekyll
```

