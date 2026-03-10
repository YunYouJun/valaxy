---
title: 最佳实践
categories:
  - guide
top: 1
---

## 文章



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



```bash
posts
└── your-post
    ├── a.png
    ├── b.png
    └── index.md
```

```md [posts/your-post/index.md]
![image a](./a.png)
![image b](./b.png)
```

