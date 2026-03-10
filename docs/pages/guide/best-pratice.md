---
title: Best Practice
categories:
  - guide
top: 1
---


## Post


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
