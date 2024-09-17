# valaxy-addon-components

**valaxy-addon-components** is a plugin that provides general-purpose Vue components for Valaxy.

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-waline?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-waline)

- **English** | [简体中文](./README.zh-CN.md)

## Installation

```bash
pnpm add valaxy-addon-components
```

<details>
<summary>Common Components</summary><br>

You can enable common components of the plugin as follows. For a full list of common components, see [Common Components](#common-components).

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
<summary>Theme Components</summary><br>

You can also extend `unplugin-vue-components` using the plugin's `ValaxyThemesResolver` to introduce third-party themes. Here is an example using the [Yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) theme:

```ts
import { defineValaxyConfig } from 'valaxy'
import { ValaxyThemesResolver } from 'valaxy-addon-components'

export default defineValaxyConfig({
  components: {
    resolvers: [ValaxyThemesResolver({ themes: ['yun'] })],
  },
})
```

| Property | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| themes | `string[]` | --- | Third-party themes to import components from |

> [!TIP]
> By default, the system will automatically recognize components under the `components` folder. To manually specify the component path relationships, theme support is required. Create a `components.json` file in the root directory of the theme, and specify the component names and their paths relative to the `components` folder, as shown below:

```json
{
  "YunCollectionItem": "collection/YunCollectionItem.vue"
}
```

<br></details>

## Usage

Most users may want to mount the components to the footer of the theme. You can create a new file in the `components` folder, such as `MyFooter.vue`, and use it as follows:

```vue
<template>
  <YunFooter>
    <VCLiveTime start-time="2022-01-01">
      <template #live-time-before>
        <span>This site has been running for</span>
      </template>
      <template #live-time-after>
        <span>suffix</span>
      </template>
    </VCLiveTime>
  </YunFooter>
</template>
```

## Common Components

### Namespace starting with VC

#### VCLiveTime

Used to display the site's uptime.

| Property | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| startTime | `string` | --- | The time from which the site starts counting |

### Third-Party Components

Encapsulates third-party services and follows general naming rules.

#### Codepen

- `CodePen`: [Codepen](https://codepen.io/)
  - Example: <https://yun.valaxy.site/examples/addons/components>
