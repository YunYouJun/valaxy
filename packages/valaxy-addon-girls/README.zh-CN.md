# valaxy-addon-girls

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-girls?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-girls)
[![License](https://img.shields.io/npm/l/valaxy-addon-girls)](https://github.com/YunYouJun/valaxy/blob/main/LICENSE)

[English](https://valaxy.site/addons/girls) | **简体中文**

一个与主题解耦的 [Valaxy](https://valaxy.site) 角色画廊插件。它支持内联数组和远程 JSON 数据源、三种响应式布局、访客自由切换布局、可配置备注与动效，以及完整的加载、失败、键盘导航和亮暗主题状态。

## 特性

- 三种响应式布局：紧凑网格、圆球星团和轨道。
- 面向 100+ 条目的渐进渲染与浏览器原生图片懒加载。
- 继承主题 CSS 变量，支持暗色模式、减少动画和键盘导航。
- 不引入装饰图片：星团使用 CSS，轨道装饰使用内联 SVG。
- 支持远程 JSON 与内联数据，并提供加载、空状态、错误和重试界面。

## 安装

```bash
pnpm add valaxy-addon-girls
```

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonGirls } from 'valaxy-addon-girls'

export default defineValaxyConfig({
  addons: [
    addonGirls(),
  ],
})
```

插件会自动注册 `ValaxyGirls` 组件：

```md
---
girls: https://example.com/girls.json
random: true
---

<ValaxyGirls :girls="frontmatter.girls" :random="frontmatter.random" layout="bubbles" switchable>
  <template #header="{ count, isLoading }">
    <header>
      <h2>喜欢的角色</h2>
      <p v-if="!isLoading">已收藏 {{ count }} 位</p>
    </header>
  </template>
</ValaxyGirls>
```

内联数据使用相同字段：

```yaml
girls:
  - name: C.C.
    avatar: https://example.com/cc.png
    from: CODE GEASS
    reason: 冷静、神秘，又有自己的温柔
    url: https://example.com/cc
```

只有 `name` 为必填字段，其他未知元数据会被保留。

## 组件 Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `autoLoad` | `boolean` | `true` | 列表接近视口时自动展示下一批；设为 `false` 后使用按钮。 |
| `batchSize` | `number` | `24` | 每次渐进展示增加的角色数量。 |
| `girls` | `GirlEntry[] \| string` | 必填 | 内联角色数组或远程 JSON 地址。 |
| `initialCount` | `number` | `24` | `grid` 首次渲染的卡片数量。 |
| `layout` | `'bubbles' \| 'grid' \| 'orbit'` | `'grid'` | 初始布局，支持 `v-model:layout`。 |
| `motion` | `'auto' \| 'off'` | `'auto'` | 使用克制的布局动效或完全关闭；`auto` 会尊重系统的减少动画设置。 |
| `random` | `boolean` | `false` | 加载后随机排列角色。 |
| `reasonMode` | `'hidden' \| 'inline' \| 'hover'` | `'hidden'` | 控制 `reason` 备注的显示方式。 |
| `renderMode` | `'progressive' \| 'all'` | `'progressive'` | 分批创建角色节点，或一次创建完整集合。 |
| `switchable` | `boolean` | `false` | 允许访客切换全部内置布局。 |

## 布局

- `grid`：向后兼容的紧凑卡片网格，适合大量角色。
- `bubbles`：把完整名册按视觉权重聚合为单一圆球星团，不生成第二份溢出列表。
- `orbit`：最多 24 位角色进入星座轨道，其余角色随滚动继续展示。

旧的 `cloud` 和 `wings` 配置会在运行时兼容为 `bubbles`，但不再属于公开类型。

站点作者可以设置初始布局，并把同样的选择权交给访客：

```md
<ValaxyGirls
  v-model:layout="layout"
  :girls="frontmatter.girls"
  switchable
/>
```

备注默认隐藏，以保持画廊紧凑：

```md
<!-- 始终显示两行以内的备注，适合触屏端也需要阅读的场景。 -->
<ValaxyGirls :girls="frontmatter.girls" reason-mode="inline" />

<!-- 鼠标悬浮或键盘聚焦时显示浮层。 -->
<ValaxyGirls :girls="frontmatter.girls" reason-mode="hover" />
```

常规手机的网格最多使用两列，`22rem` 及以下自动切换为一列。圆球舞台会保留全部头像并随容器缩放，选中详情位于星团下方；悬浮或聚焦头像时，当前圆球会提升到相邻头像上方，并显示角色名与出自作品。

对于大量角色，网格默认创建 24 张卡片，在底部触发器接近视口时按 `batchSize` 自动追加；轨道会在 24 位舞台角色之后使用同样的触发器。圆球星团为了保持完整轮廓，会一次创建全部轻量圆球，因此 `renderMode` 只影响网格与溢出列表。触发器基于 `IntersectionObserver`，不支持时回退为按钮；也可以通过 `:auto-load="false"` 主动使用按钮。头像使用原生 `loading="lazy"` 与异步解码，约一百个角色不需要额外虚拟列表依赖。

需要完整 DOM 时可以显式使用 `all`：

```md
<ValaxyGirls
  girls="https://wives.yunyoujun.cn/girls.json"
  layout="grid"
  render-mode="all"
/>
```

默认访问体验仍推荐渐进模式。对于 100+ 条目，可以同时调整首批与每批数量：

```md
<ValaxyGirls
  girls="https://wives.yunyoujun.cn/girls.json"
  layout="grid"
  :initial-count="24"
  :batch-size="24"
  :auto-load="true"
/>
```

首批会渲染 24 位角色，滚动触发器接近视口后自动追加 24 位，无需点击。

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:layout` | `GirlsLayout` | 访客选择布局后为 `v-model:layout` 发送更新。 |
| `layoutChange` | `GirlsLayout` | 与模型更新同时触发，适合直接监听布局变化。 |

```md
<ValaxyGirls
  v-model:layout="layout"
  :girls="frontmatter.girls"
  switchable
  @layout-change="onLayoutChange"
/>
```

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `header` | `{ count, error, isLoading, random }` | 替换可选画廊标题，并暴露当前数据源状态。 |

```md
<ValaxyGirls :girls="frontmatter.girls">
  <template #header="{ count, error, isLoading }">
    <p v-if="isLoading">正在加载角色…</p>
    <p v-else-if="error">角色名册暂时不可用</p>
    <p v-else>共 {{ count }} 位角色</p>
  </template>
</ValaxyGirls>
```

## 样式覆盖

在 `.valaxy-girls` 上覆盖以下 CSS 变量即可适配主题：

- `--valaxy-girls-soft`
- `--valaxy-girls-sky`
- `--valaxy-girls-sky-deep`
- `--valaxy-girls-blush`
- `--valaxy-girls-ink`
- `--valaxy-girls-muted`
- `--valaxy-girls-paper`
- `--valaxy-girls-line`

Valaxy 用户也可以通过标准组件覆盖机制，在站点 `components/` 目录替换 `ValaxyGirls.vue`。包还会导出 `ValaxyGirlCard`，便于组合自定义画廊外壳。

## Client API

包会导出 `useGirls`、`useProgressiveCount`、确定性布局工具，以及 `GirlEntry`、`GirlReasonMode`、`GirlsLayout`、`GirlsMotionMode`、`GirlsRenderMode`、`GirlsSource` 和 `GirlsHeaderSlotProps` 类型。`useGirls` 会在挂载后发起远程请求、取消过期请求，并保持服务端与客户端标记一致。

## 文档与开发

- [English guide](https://valaxy.site/addons/girls)
- [简体中文文档](https://valaxy.site/zh/addons/girls)
- [在线示例源码](https://github.com/YunYouJun/valaxy/tree/main/demo/yun/pages/girls/index.md)

在 Valaxy monorepo 根目录运行：

```bash
pnpm --filter valaxy-addon-girls test
pnpm lint
pnpm typecheck
```

## License

[MIT](https://github.com/YunYouJun/valaxy/blob/main/LICENSE) © YunYouJun
