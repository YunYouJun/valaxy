---
title: Components
title_zh-CN: 自定义组件
categories:
  - Custom
end: false
---

## 自动组件注册

新建 `components` 文件夹，书写任意 Vue 组件。
它们会被自动注册，你甚至可以在你的 Markdown 文件中使用它。

如果存在与主题、Valaxy 的同名组件，覆盖顺序为 `用户目录` -> `主题目录` -> `Valaxy 客户端目录`。
这也意味着你可以只覆盖主题的某个组件，来达到自定义局部主题的效果！

### 自定义覆盖主题组件

基于此，你可以非常容易地自定义主题的任何地方！

譬如自定义页脚：

> 可参见 [demo/yun/components/YunFooter.vue | GitHub](https://github.com/YunYouJun/valaxy/blob/main/demo/yun/components/YunFooter.vue)

在博客文件夹中 `components` 目录下，新建 `YunFooter.vue` 覆盖你的主题页脚文件。

你可以直接替换掉页脚内容：

```vue
<template>
  <div>页脚内容</div>
</template>
```

也可以继承扩展此前的页脚：

```vue
<script lang="ts" setup>
import YunFooter from 'valaxy-theme-yun/components/YunFooter.vue'
</script>

<template>
  <YunFooter>
    自定义页脚内容
  </YunFooter>
</template>
```

## 更多示例

### 插入不蒜子统计

> [不蒜子统计](http://ibruce.info/2015/04/04/busuanzi/)

以 valaxy-theme-yun 为例：

> 默认指在你的博客文件夹下进行操作。

在 `components/` 文件夹下新建 `YunFooter.vue` 以自定义页脚并显示不蒜子统计。
你可以根据你的需要自由定制它的样式。

```vue
<script lang="ts" setup>
import { useScriptTag } from '@vueuse/core'
import YunFooter from 'valaxy-theme-yun/components/YunFooter.vue'

useScriptTag('//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js')
</script>

<template>
  <YunFooter>
    <!-- 自定义页脚内容 -->
    <div>本站总访问量 <span id="busuanzi_value_site_pv" /> 次</div>
    <div>本站访客数 <span id="busuanzi_value_site_uv" /> 人次</div>
  </YunFooter>
</template>
```

在 `components/` 文件夹下新建 `YunPostMeta.vue` 以自定义每篇文章的信息并显示不蒜子单篇文章统计。

```vue
<script lang="ts" setup>
import type { Post } from 'valaxy'
import YunPostMeta from 'valaxy-theme-yun/components/YunPostMeta.vue'

defineProps<{
  frontmatter: Post
}>()
</script>

<template>
  <YunPostMeta :frontmatter="frontmatter">
    <span id="busuanzi_container_page_pv">
      本文总阅读量 <span id="busuanzi_value_page_pv" /> 次
    </span>
  </YunPostMeta>
</template>
```

原理即覆盖组件，您还可以自由覆盖主题的任意其他组件。
