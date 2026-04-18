# valaxy-addon-meting

[![npm](https://img.shields.io/npm/v/valaxy-addon-meting)](https://www.npmjs.com/package/valaxy-addon-meting)

Global music player based on [APlayer](https://github.com/DIYgod/APlayer) and [MetingJS](https://github.com/metowolf/MetingJS).

## Usage

```ts
import { defineConfig } from 'valaxy'
import { addonMeting } from 'valaxy-addon-meting'

export default defineConfig({
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

### Custom API

Since the default `api.i-meto.com` is no longer available, you can set your own [Meting API](https://github.com/metowolf/Meting) endpoint:

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

> API URL supports placeholders: `:server`, `:type`, `:id`, `:auth`, `:r`
>
> See [MetingJS - Advanced Usage](https://github.com/metowolf/MetingJS#advanced-usage) for details.

## Configuration

### `MetingOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `global` | `boolean` | `false` | Enable global fixed player on all pages |
| `props` | `MetingProps` | — | Props for `<meting-js>` element ([MetingJS options](https://github.com/metowolf/MetingJS#option)) |
| `options` | `object` | — | Addon-specific behaviors (see below) |

### `props` (MetingProps)

All attributes from [MetingJS options](https://github.com/metowolf/MetingJS#option):

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Song / playlist / album ID or search keyword |
| `server` | `'netease' \| 'tencent' \| 'kugou' \| 'xiami' \| 'baidu'` | — | Music platform |
| `type` | `'song' \| 'album' \| 'artist' \| 'playlist' \| 'search'` | — | Resource type |
| `auto` | `string` | — | Music link for auto-parsing |
| `api` | `string` | — | Custom Meting API URL |
| `fixed` | `boolean` | `false` | Enable fixed (sticky bottom) mode |
| `mini` | `boolean` | `false` | Enable mini mode |
| `autoplay` | `boolean` | `false` | Audio autoplay |
| `theme` | `string` | `'#2980b9'` | Theme color |
| `loop` | `'all' \| 'one' \| 'none'` | `'all'` | Loop mode |
| `order` | `'list' \| 'random'` | `'list'` | Play order |
| `preload` | `'auto' \| 'metadata' \| 'none'` | `'auto'` | Audio preload |
| `volume` | `number` | `0.7` | Default volume |
| `mutex` | `boolean` | `true` | Pause other players when playing |
| `lrc-type` | `number` | `0` | Lyric type |
| `list-folded` | `boolean` | `false` | Fold playlist by default |
| `list-max-height` | `string` | `'340px'` | Max height of playlist |
| `storage-name` | `string` | `'metingjs'` | localStorage key for player settings |

Self-hosted media attributes: `name`, `artist`, `url`, `cover`.

### `options`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `animationIn` | `boolean` | `false` | Enable slide-in animation on load |
| `autoHidden` | `boolean` | `false` | Auto-hide player when collapsed |
| `lyricHidden` | `boolean` | `false` | Hide lyric panel |

### Priority

Props are resolved in this order (highest to lowest):

1. Component props (passed directly to `<MetingJs>`)
2. Addon `props` config (from `addonMeting({ props: { ... } })`)
3. Built-in defaults

## Component Usage

Besides the global player, you can use the `<MetingJs>` component in any page:

```vue
<MetingJs id="28391863" server="netease" type="song" />
```

## FAQ

- `import 'meting/dist/Meting.min.js'` is not working, only CDN works.
