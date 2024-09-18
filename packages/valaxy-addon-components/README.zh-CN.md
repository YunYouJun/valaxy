# valaxy-addon-components

**valaxy-addon-components** 是一个为 Valaxy 提供通用 Vue 组件的插件

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-waline?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-waline)

- [English](./README.md) | **简体中文**

## 安装

```bash
pnpm add valaxy-addon-components
```

<details>
<summary>通用组件</summary><br>

可以通过以下方式启用插件的通用组件，关于通用组件的完整列表，请参见 [通用组件](#通用组件)

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonComponents } from 'valaxy-addon-components'

export default defineValaxyConfig({
  addons: [
    addonComponents(),
  ],
})
```

<br></details>

<details>
<summary>主题组件</summary><br>

还可以通过插件 `ValaxyThemesResolver` 功能扩展 `unplugin-vue-components`，实现引入第三方主题。以下以 [Yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) 主题为例：

```ts
import { defineValaxyConfig } from 'valaxy'
import { ValaxyThemesResolver } from 'valaxy-addon-components'

export default defineValaxyConfig({
  components: {
    resolvers: [ValaxyThemesResolver({ themes: ['yun'] })],
  },
})
```

| 属性名 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| themes | `string[]` | --- | 需要导入 components 的第三方主题 |

> [!TIP]
> 通常情况下，系统会自动识别 `components` 文件夹下的组件。如果需要手动指定组件路径关系，必须在主题中支持此功能。在主题根目录下新建 `components.json` 文件，并在文件中指定组件名和组件相对于 `components` 文件夹的路径，如下示例：

```json
{
  "YunCollectionItem": "collection/YunCollectionItem.vue"
}
```

<br></details>

## 使用

大多数用户可能希望将组件挂载到主题的页脚。你可以在 `components` 文件夹下新建一个文件，例如 `MyFooter.vue`，并按如下方式使用：

```vue
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

## 通用组件

### 命名空间以 VC 开头

#### VCLiveTime

用于显示站点的生存时间

| 属性名 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| startTime | `string` | --- | 设置站点开始计时的时间 |

### 第三方组件

对第三方服务进行封装，优先使用通用命名规则。

#### Codepen

- `CodePen`: [Codepen](https://codepen.io/)
  - Example: <https://yun.valaxy.site/examples/addons/components>
