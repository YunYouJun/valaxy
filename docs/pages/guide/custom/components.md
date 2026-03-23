---
title: Custom Components
categories:
  - custom
end: false
---

## Automatic Component Registration

Create `components` folder, write any Vue components.
They will be registered automatically and you can even use them in your Markdown files.

If there are components with the same name as the theme and Valaxy, the order of overriding is `user directory` -> `theme directory` -> `Valaxy client directory`.

This also means that you can cover one component of the theme to achieve customizing the local theme!

### Disable Default Registration

You can place components in folders **other than** `components` or in the `components/.exclude` folder.

You can also customize the exclusion rules.

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  /**
   * @see https://github.com/unplugin/unplugin-vue-components#configuration
   * `/[\\/]node_modules[\\/]/, ` Don't exclude components under node_modules/valaxy/client/components
   */
  components: {
    exclude: [/[\\/]\.git[\\/]/, /[\\/]\.exclude[\\/]/],
  },
})
```

### Custom Override Theme Component

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

### More Examples

### Insert Busuanzi Statistics

> [Busuanzi Statistics](http://ibruce.info/2015/04/04/busuanzi/)

Take valaxy-theme-yun as an example:

> By default, operate in your blog folder.

Create a new `YunFooter.vue` under the `components/` folder to customize the footer and display *Busuanzi Statistics*.
You can customize its style freely according to your needs.

```vue [components/YunFooter.vue]
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

```vue [components/YunPostMeta.vue]
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

### Other

[valaxy-addon-components](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components) is also a plugin that makes full use of this mechanism. You can also refer to its implementation method and freely publish your custom components in the form of Valaxy plugin.

> Because Vue components published is native, it will be completely **on-demand** when packaging, without your extra worry.

[Example of using valaxy-addon-components to insert public components](https://yun.valaxy.site/examples/addons/components)
