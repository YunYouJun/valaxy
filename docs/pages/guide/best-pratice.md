---
title: Best Practice
title_zh: 最佳实践
categories:
  - guide
top: 1
---

## 文章 {lang="zh-CN"}

## Post {lang="en"}

::: zh-CN

以下是我们推荐的部分最佳实践，但您不必完全遵守。

1. 建议使用英文命名文件夹和文件，如  `blog/pages/posts/your-post.md`。

2. 插入第三方/大量动态内容时，优先将其封装为组件放置于 `components`，并通过组件标签名引入，以下是一个例子。

```vue [blog/components/BszComponent.vue]
<script lang="ts" setup>
import { useScriptTag } from '@vueuse/core'

useScriptTag('//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js')
</script>

<template>
  <div>
    <div>本站总访问量 <span id="busuanzi_value_site_pv" /> 次</div>
    <div>本站访客数 <span id="busuanzi_value_site_uv" /> 人次</div>
  </div>
</template>
```

```md [blog/pages/posts/test-custom-component.md]
# hello World
<BszComponent/>
```

3. 如果文章中不想使用外链图片，建议按照以下格式创建文件夹及引用图片，便于管理和迁移。

:::

::: en

The following are some of our recommended best practices, but you do not need to fully adhere to them.

1. It is recommended to name folders and files in English.

```txt
blog/pages/posts/your-post.md
```

2. When inserting third-party/large amounts of dynamic content, priority should be given to encapsulating it as a component and placing it in `blog/components`, and introducing it through component tag names.

```vue [blog/components/BszComponent.vue]
<script lang="ts" setup>
import { useScriptTag } from '@vueuse/core'

useScriptTag('//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js')
</script>

<template>
  <div>
    <div>Total visits to this site <span id="busuanzi_value_site_pv" /> times</div>
    <div>Visitors to this site <span id="busuanzi_value_site_uv" /></div>
  </div>
</template>
```

```md [blog/pages/posts/test-custom-component.md]
# hello World
<BszComponent/>
```

3. If you do not want to use external links in the post, it is recommended to create folders and reference images in the following format for easy management and migration.

:::

```txt
posts
├─ your-post
│  ├─ a.png
|  ├─ b.png
│  └─ index.md
```

```md [posts/your-post/index.md]
![](./a.png)
![](./b.png)
```
