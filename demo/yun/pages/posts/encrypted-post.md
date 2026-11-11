---
title: '加密文章测试 - 密码 valaxy'
date: 2023-08-06 12:00:00
categories: Test
password: valaxy
password_hint: 这是密码提示
---

这里是被加密的复杂文章内容

## 实现文章加密

使用 [Web Crypto API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

```ts
// node
import { webcrypto } from 'node:crypto'

// browser
window.crypto
```

## 解密时文章渲染

存在如下内容，解密时还原，需动态渲染。

```md
{{ frontmatter }}
```

::: details 动态渲染的 frontmatter
{{ frontmatter }}
:::

```vue
<script lang="ts" setup>
const frontmatter = useFrontmatter()
</script>

<template>
  <ValaxyDynamicComponent
    :template-str="decryptedContent" :data="{ frontmatter }"
    @rendered="runContentUpdated"
  />
</template>
```

## FAQ

```bash
Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".
```

如果自定义组件直接使用 Vue 的 `template` 选项或 `compile()`，可启用完整编译模式：

```ts
export default defineValaxyConfig({
  vue: {
    browserTemplateCompilation: true,
  },
})
```

默认值为 `'lazy'`，解密内容与 `excerpt_type: html` 摘要会按需加载编译器，无需启用完整模式。
设为 `false` 会关闭浏览器模板编译，动态摘要和解密模板也将无法渲染。
