# valaxy-addon-meting

[![npm](https://img.shields.io/npm/v/valaxy-addon-meting)](https://www.npmjs.com/package/valaxy-addon-meting)

[English](https://valaxy.site/addons/official/meting) | **简体中文**

基于 [APlayer](https://github.com/DIYgod/APlayer) 和 [MetingJS](https://github.com/metowolf/MetingJS) 的 Valaxy 全局音乐播放器。

## 使用

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonMeting } from 'valaxy-addon-meting'

export default defineValaxyConfig({
  addons: [
    addonMeting({
      global: true,
      props: {
        id: '2049540645',
        server: 'netease',
        type: 'song',
      },
    }),
  ],
})
```

### 自定义 API

默认的 `api.i-meto.com` 已不可用，请配置自己的 [Meting API](https://github.com/metowolf/Meting) 地址：

```ts
addonMeting({
  global: true,
  props: {
    id: '2049540645',
    server: 'netease',
    type: 'song',
    api: 'https://your-meting-api.example.com/api?server=:server&type=:type&id=:id&r=:r',
  },
})
```

> API 地址支持 `:server`、`:type`、`:id`、`:auth` 和 `:r` 占位符。
>
> 详情请参考 [MetingJS 高级用法](https://github.com/metowolf/MetingJS#advanced-usage)。

## 配置

### `MetingOptions`

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `global` | `boolean` | `false` | 在全部页面启用全局固定播放器 |
| `props` | `MetingProps` | — | `<meting-js>` 元素属性，参见 [MetingJS 配置](https://github.com/metowolf/MetingJS#option) |
| `options` | `object` | — | 插件行为配置，见下文 |

### `props`（MetingProps）

支持 [MetingJS 配置](https://github.com/metowolf/MetingJS#option)中的全部属性：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | — | 歌曲、歌单、专辑 ID 或搜索关键词 |
| `server` | `'netease' \| 'tencent' \| 'kugou' \| 'xiami' \| 'baidu'` | — | 音乐平台 |
| `type` | `'song' \| 'album' \| 'artist' \| 'playlist' \| 'search'` | — | 资源类型 |
| `auto` | `string` | — | 自动解析的音乐链接 |
| `api` | `string` | — | 自定义 Meting API 地址 |
| `fixed` | `boolean` | `false` | 固定在页面底部 |
| `mini` | `boolean` | `false` | 使用迷你模式 |
| `autoplay` | `boolean` | `false` | 自动播放 |
| `theme` | `string` | `'#2980b9'` | 主题色 |
| `loop` | `'all' \| 'one' \| 'none'` | `'all'` | 循环模式 |
| `order` | `'list' \| 'random'` | `'list'` | 播放顺序 |
| `preload` | `'auto' \| 'metadata' \| 'none'` | `'auto'` | 音频预加载策略 |
| `volume` | `number` | `0.7` | 默认音量 |
| `mutex` | `boolean` | `true` | 播放时暂停其他播放器 |
| `lrc-type` | `number` | `0` | 歌词类型 |
| `list-folded` | `boolean` | `false` | 默认折叠播放列表 |
| `list-max-height` | `string` | `'340px'` | 播放列表最大高度 |
| `storage-name` | `string` | `'metingjs'` | 播放器设置的 localStorage 键名 |

自托管媒体还支持 `name`、`artist`、`url` 与 `cover` 属性。

### `options`

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `animationIn` | `boolean` | `false` | 加载时启用滑入动画 |
| `autoHidden` | `boolean` | `false` | 折叠后自动隐藏播放器 |
| `lyricHidden` | `boolean` | `false` | 隐藏歌词面板 |

### 优先级

属性按以下优先级解析（从高到低）：

1. 直接传给 `<MetingJs>` 的组件属性。
2. `addonMeting({ props: { ... } })` 中的插件属性。
3. 内置默认值。

## 组件用法

除了全局播放器，还可以在任意页面直接使用 `<MetingJs>`：

```vue
<MetingJs id="28391863" server="netease" type="song" />
```

## FAQ

- `import 'meting/dist/Meting.min.js'` 无法工作，目前只能使用 CDN。
