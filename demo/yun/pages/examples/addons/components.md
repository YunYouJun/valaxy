---
title: 常用公共组件 | Valaxy Addon Components
categories:
  - Docs
  - Example
codepen: false
---

## 安装

更多可参见 [README | valaxy-addon-components](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components).

`valaxy-addon-components` 是 valaxy 的一个插件，它内置了一些公共第三方组件，譬如 Codepen `<CodePen />`。

```bash
pnpm add -D valaxy-addon-components
```

```ts
// valaxy.config.ts
import { defineValaxyConfig } from 'valaxy'
import { addonComponents } from 'valaxy-addon-components'

export default defineValaxyConfig({
  addons: [
    addonComponents(),
  ],
})
```

更多使用示例如下。

### 插入 [CodePen](https://codepen.io/)

#### 使用

```vue
<!-- needed -->
<CodePen id="WqXGpo" user="YunYouJun" />

<!-- 自定义插槽（ CodePen 默认展示未加载完时显示的内容） -->
<CodePen id="WqXGpo" user="YunYouJun">
  <span> Custom Slot </span>
</CodePen>

<!-- all parameters -->
<CodePen class="h-300px" name="Margin Collapse" id="WqXGpo" user="YunYouJun" tab="html,result" />
```

<CodePen class="h-300px" name="Margin Collapse" id="WqXGpo" user="YunYouJun" tab="html,result" />
