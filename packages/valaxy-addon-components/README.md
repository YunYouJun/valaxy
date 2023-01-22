# valaxy-addon-waline

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-waline?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-waline)

TODO: English Docs

valaxy-addon-components 是可以提供通用 Vue 组件 的一个 Valaxy 插件。

主题开发者可以通过将其作为依赖使用，以快速使用内置组件。

## 组件列表

> 命名空间以 VC 开头。

- `VCLiveTime`: 生存时间

## 如何使用

### 安装依赖

```bash
npm i valaxy-addon-components
```

### 加载插件

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonComponents } from 'valaxy-addon-components'

export default defineValaxyConfig({
  addons: [
    addonComponents(),
  ],
})
```

### 在任意地方使用并设置你的参数

> 大部分人可能希望挂在主题页脚
> 这里以主题 `valaxy-theme-yun` 为例：

- `start-time`: 代表站点成立开始计时的时间

```vue
<!-- 新建 components/YunFooter.vue -->
<script lang="ts" setup>
import YunFooter from 'valaxy-theme-yun/components/YunFooter.vue'
</script>

<template>
  <YunFooter>
    <VCLiveTime start-time="2022-01-01">
      <template #live-time-before>
        <span>本站已运行</span>
      </template>
      <template #live-time-after>
        <span>后缀</span>
      </template>
    </VCLiveTime>
  </YunFooter>
</template>
```
