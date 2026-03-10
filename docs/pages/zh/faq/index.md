---
title: FAQ
categories:
  - guide
end: false
---

## 构建失败

### ReferenceError: document is not defined

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


## Change Generated Directory Style


Valaxy builds `xxx.md` as `/xxx.html` by default.

If you prefer to build them as `/xxx/index.html`, you can modify the configuration of `vite-ssg`.

Set it in `vite.config.ts` under the user directory as follows:

```ts [vite.config.ts]
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
  ssgOptions: {
    dirStyle: 'nested',
  }
})
```


## After deploying to Github Pages, some pages cannot be accessed or the JS path cannot be found


Github Pages uses Jekyll by default to build static sites, and Jekyll does not build files or folders that start with `_` by default.

The output of the Valaxy build may contain files that start with `_`, so these files will be ignored by Jekyll’s build after submission, causing problems.

In fact, the output of the Valaxy build can be used directly as a static site without the need for redundant Jekyll build operations.

If there is an empty file named .nojekyll in the root path of the content deployed by Github Pages, the Jekyll build operation will be skipped.

So you can create a new file named `.nojekyll` in the `public` folder of the project:

```bash
|-- public
|   |-- .nojekyll
```
