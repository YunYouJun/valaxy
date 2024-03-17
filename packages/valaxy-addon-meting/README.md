# valaxy-addon-meting

Global music player based on [APlayer](https://github.com/DIYgod/APlayer) and [MetingJS](https://github.com/metowolf/MetingJS).

```ts
import { defineConfig } from 'valaxy'
import { addonMeting } from 'valaxy-addon-meting'

export default defineConfig({
  addons: [
    addonMeting({
      global: true,
      /** @see https://github.com/metowolf/MetingJS */
      props: {
        id: '2049540645',
        server: 'netease',
        type: 'song',
      },
    })
  ]
})
```

```ts
export interface MetingOptions {
  global?: boolean
  /** @see https://github.com/metowolf/MetingJS#option */
  props?: {
    id?: string
    server?: 'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
    type?: 'song' | 'album' | 'artist' | 'playlist' | 'search'
  }
  options?: {
    animationIn?: boolean
    autoHidden?: boolean
    lyricHidden?: boolean
  }
}
```

| Configuration Item                    | Description                                                                                        | Default Value |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------- |
| **animationIn** (optional)      | Specifies whether to hide the lyrics upon startup                                                | `false`       |
| **autoHidden** (optional)        | Enables auto-hiding of the APlayer interface when not interacted with. Recommended for use with `aplayerVisibleAfterLoad`                            | `false`        |
| **lyricHidden** (optional) | Determines whether the APlayer interface should be visible immediately after loading is complete | `false`        |

## props

You can [meting#options](https://github.com/metowolf/MetingJS#option)

## FAQ

- `import 'meting/dist/Meting.min.js'` is not working, only cdn work
