---
title:
  en: Custom Components
  zh-CN: 自定义组件
categories:
  - custom
end: false
---

## 自动组件注册 {lang="zh-CN"}

## Automatic Component Registration {lang="en"}

:::zh-CN
新建 `components` 文件夹，书写任意 Vue 组件。
它们会被自动注册，你甚至可以在你的 Markdown 文件中使用它。

如果存在与主题、Valaxy 的同名组件，覆盖顺序为 `用户目录` -> `主题目录` -> `Valaxy 客户端目录`。

这也意味着你可以只覆盖主题的某个组件，来达到自定义**局部**主题的效果！
:::

:::en
Create `components` folder, write any Vue components.
They will be registered automatically and you can even use them in your Markdown files.

If there are components with the same name as the theme and Valaxy, the order of overriding is `user directory` -> `theme directory` -> `Valaxy client directory`.

This also means that you can cover one component of the theme to achieve customizing the local theme!
:::

### 取消默认注册

你可以将组件放置于**非** `components` 文件夹或 `components/.exclude` 文件夹下。

你也可以自定义排除规则。

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  /**
   * @see https://github.com/unplugin/unplugin-vue-components#configuration
   * `/[\\/]node_modules[\\/]/, ` 不要排除 node_modules/valaxy/client/components 下的组件
   */
  components: {
    exclude: [/[\\/]\.git[\\/]/, /[\\/]\.exclude[\\/]/],
  },
})
```

### 自定义覆盖主题组件 {lang="zh-CN"}

### Custom Override Theme Component {lang="en"}

:::zh-CN
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

:::

:::en
Based on this, you can easily customize the theme anywhere!

For example, custom footer:

> Refer to [demo/yun/components/YunFooter.vue | GitHub](https://github.com/YunYouJun/valaxy/blob/main/demo/yun/components/YunFooter.vue)

In the `components` directory of the blog folder, create a new `YunFooter.vue` to overwrite the footer file of your theme.

You can replace the footer directly:

```vue
<template>
  <div>Footer content</div>
</template>
```

You can also inherit and extend the previous footer:

```vue
<script lang="ts" setup>
import YunFooter from 'valaxy-theme-yun/components/YunFooter.vue'
</script>

<template>
  <YunFooter>
    Customize footer content
  </YunFooter>
</template>
```

:::

### 更多示例 {lang="zh-CN"}

### More Examples {lang="en"}

### 插入不蒜子统计 {lang="zh-CN"}

### Insert Busuanzi Statistics {lang="en"}

:::zh-CN
> [不蒜子统计](http://ibruce.info/2015/04/04/busuanzi/)

以 valaxy-theme-yun 为例：

> 默认指在你的博客文件夹下进行操作。

在 `components/` 文件夹下新建 `YunFooter.vue` 以自定义页脚并显示不蒜子统计。
你可以根据你的需要自由定制它的样式。

```vue [components/YunFooter.vue]
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

```vue [components/YunPostMeta.vue]
<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useLayout } from 'valaxy'
import YunPostMeta from 'valaxy-theme-yun/components/YunPostMeta.vue'

defineProps<{
  frontmatter: Post
}>()

// 仅在 Post 布局显示
const isPost = useLayout('post')
</script>

<template>
  <YunPostMeta :frontmatter="frontmatter">
    <span v-if="isPost" id="busuanzi_container_page_pv">
      本文总阅读量 <span id="busuanzi_value_page_pv" /> 次
    </span>
  </YunPostMeta>
</template>
```

原理即覆盖组件，您还可以自由覆盖主题的任意其他组件。
:::

:::en
> [Busuanzi Statistics](http://ibruce.info/2015/04/04/busuanzi/)

Take valaxy-theme-yun as an example:

> By default, operate in your blog folder.

Create a new `YunFooter.vue` under the `components/` folder to customize the footer and display *Busuanzi Statistics*.
You can customize its style freely according to your needs.

```vue
<script lang="ts" setup>
import { useScriptTag } from '@vueuse/core'
import YunFooter from 'valaxy-theme-yun/components/YunFooter.vue'

useScriptTag('//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js')
</script>

<template>
  <YunFooter>
    <!-- customize footer content -->
    <div>Total visits of this site <span id="busuanzi_value_site_pv" /></div>
    <div>Number of visitors <span id="busuanzi_value_site_uv" /></div>
  </YunFooter>
</template>
```

Create a new `YunPostMeta.vue` under the `components/` folder to customize the information of each article and display the statistics of each article.

```vue
<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useLayout } from 'valaxy'
import YunPostMeta from 'valaxy-theme-yun/components/YunPostMeta.vue'

defineProps<{
  frontmatter: Post
}>()

// Display only in Post layout
const isPost = useLayout('post')
</script>

<template>
  <YunPostMeta :frontmatter="frontmatter">
    <span v-if="isPost" id="busuanzi_container_page_pv">
      Total reading of this article <span id="busuanzi_value_page_pv" />
    </span>
  </YunPostMeta>
</template>
```

The principle is to cover components. You can also freely cover any other components of the theme.
:::

### 其他 {lang="zh-CN"}

### Other {lang="en"}

:::zh-CN
[valaxy-addon-components](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components) 也是一个充分利用该机制的插件，你也可以参考它的实现方式，以 Valaxy 插件的形式自由发布你的自定义组件。

> 由于发布的是原生的 Vue 组件，所以打包时它将会完全是**按需**的，无需您额外担忧。
:::

:::en
[valaxy-addon-components](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components) is also a plugin that makes full use of this mechanism. You can also refer to its implementation method and freely publish your custom components in the form of Valaxy plugin.

> Because Vue components published is native, it will be completely **on-demand** when packaging, without your extra worry.
:::

[使用 valaxy-addon-components 插入公共组件的示例](https://yun.valaxy.site/examples/addons/components)
