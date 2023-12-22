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

## props

You can [meting#options](https://github.com/metowolf/MetingJS#option)

## FAQ

- `import 'meting/dist/Meting.min.js'` is not working, only cdn work
